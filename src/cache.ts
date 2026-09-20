/**
 * Durable per-message humanize cache (backend: DSH `storageDomain` seam).
 *
 * Stores the humanized result per assistant-message so reopening the popup on
 * the same message shows the cached rewrite without burning another model
 * call. Keying is stable only when `messageId` AND the source text are
 * unchanged: a regenerated message keeps its id but gets new content, so the
 * cache entry is only reused after an exact `original` match (see
 * {@link isFreshCacheRecord}).
 *
 * Best-effort by design: both the `storage-domain` package and the
 * `storageDomain` service are resolved lazily at call time, so a profile
 * without them simply runs without caching instead of failing plugin load.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { Domain } from '@deepseek-ai/dsh-storage-domain'

/** One cached rewrite: the produced text plus the source it was derived from. */
export interface HumanizeCacheRecord {
  /** Original (pre-humanization) text this result is derived from. */
  original: string
  /** Humanized result text. */
  text: string
  /** Unix ms timestamp of the last write (used for LRU eviction). */
  ts: number
}

/** The cache entry is valid only when derived from the exact same source text. */
export function isFreshCacheRecord(
  record: HumanizeCacheRecord | undefined,
  text: string,
): record is HumanizeCacheRecord {
  return !!record && record.original === text && record.text.length > 0
}

/**
 * Deterministic cache key for one assistant message.
 * Uses `messageId` when available; identical anon text falls back to a hash so
 * messages without an id still get stable, non-colliding keys.
 */
export function humanizeCacheKey(messageId: string | undefined, text: string): string {
  return messageId ? `msg:${messageId}` : `anon:${fnv1a(text).toString(36)}`
}

/** Read/write handle over the persisted humanize results. */
export interface ShuorenhuaCache {
  /** Synchronous read from the in-memory mirror of the opened domain. */
  read(key: string): HumanizeCacheRecord | undefined
  /** Durable write; enforces a soft LRU cap. */
  persist(key: string, record: HumanizeCacheRecord): Promise<void>
  /** Release the underlying domain. The caller owns this (same contract as `Domain.close`). */
  close(): Promise<void>
}

/** Mutable slot filled by the storage-domain wiring and read by the HTTP routes. */
export interface ShuorenhuaCacheHolder {
  current: ShuorenhuaCache | null
}

/**
 * Open the cache domain on the current context. Domain/table names must match
 * `^[a-z][a-z0-9_]*$` (no hyphens), hence `shuorenhua` / `humanize`.
 * Returns `null` (and logs) when the package or the `storageDomain` seat is
 * unavailable, so callers simply fall back to the uncached path.
 */
export async function openShuorenhuaCache(
  ctx: Context,
  maxEntries = 100,
): Promise<ShuorenhuaCache | null> {
  try {
    const facility = (ctx as any).get('storageDomain')
    if (!facility || typeof facility.open !== 'function') {
      ctx.logger.debug('shuorenhua cache disabled: storageDomain service not available')
      return null
    }

    // Lazy runtime imports: an absent dependency degrades to "no cache".
    const storage = await import('@deepseek-ai/dsh-storage-domain').catch((error: unknown) => {
      ctx.logger.debug('shuorenhua cache disabled: @deepseek-ai/dsh-storage-domain unavailable', error)
      return null
    })
    if (!storage) return null
    const zod = await import('zod').catch((error: unknown) => {
      ctx.logger.debug('shuorenhua cache disabled: zod unavailable', error)
      return null
    })
    if (!zod) return null

    const { defineDomain, domainTable } = storage
    const spec = defineDomain({
      name: 'shuorenhua',
      version: 1,
      tables: {
        humanize: domainTable(
          zod.z.object({
            original: zod.z.string(),
            text: zod.z.string(),
            ts: zod.z.number(),
          }),
        ),
      },
    })
    const domain = (await facility.open(spec)) as Domain<typeof spec>
    const table = domain.table('humanize')

    return {
      read: (key) => table.get(key),
      async persist(key, record) {
        if (table.size >= maxEntries) {
          let oldest: [string, HumanizeCacheRecord] | undefined
          for (const entry of table.entries()) {
            if (!oldest || entry[1].ts < oldest[1].ts) oldest = entry
          }
          if (oldest) await table.delete(oldest[0])
        }
        await table.put(key, record)
      },
      close: () => domain.close(),
    }
  } catch (error) {
    ctx.logger.warn('shuorenhua cache open failed, continuing without cache', error)
    return null
  }
}

/** Deterministic 32-bit FNV-1a (non-cryptographic; cache keys only). */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}