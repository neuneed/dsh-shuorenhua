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
import type { Context } from '@deepseek-ai/cordis';
/** One cached rewrite: the produced text plus the source it was derived from. */
export interface HumanizeCacheRecord {
    /** Original (pre-humanization) text this result is derived from. */
    original: string;
    /** Humanized result text. */
    text: string;
    /** Unix ms timestamp of the last write (used for LRU eviction). */
    ts: number;
}
/** The cache entry is valid only when derived from the exact same source text. */
export declare function isFreshCacheRecord(record: HumanizeCacheRecord | undefined, text: string): record is HumanizeCacheRecord;
/**
 * Deterministic cache key for one assistant message.
 * Uses `messageId` when available; identical anon text falls back to a hash so
 * messages without an id still get stable, non-colliding keys.
 */
export declare function humanizeCacheKey(messageId: string | undefined, text: string): string;
/** Read/write handle over the persisted humanize results. */
export interface ShuorenhuaCache {
    /** Synchronous read from the in-memory mirror of the opened domain. */
    read(key: string): HumanizeCacheRecord | undefined;
    /** Durable write; enforces a soft LRU cap. */
    persist(key: string, record: HumanizeCacheRecord): Promise<void>;
    /** Release the underlying domain. The caller owns this (same contract as `Domain.close`). */
    close(): Promise<void>;
}
/** Mutable slot filled by the storage-domain wiring and read by the HTTP routes. */
export interface ShuorenhuaCacheHolder {
    current: ShuorenhuaCache | null;
}
/**
 * Open the cache domain on the current context. Domain/table names must match
 * `^[a-z][a-z0-9_]*$` (no hyphens), hence `shuorenhua` / `humanize`.
 * Returns `null` (and logs) when the package or the `storageDomain` seat is
 * unavailable, so callers simply fall back to the uncached path.
 */
export declare function openShuorenhuaCache(ctx: Context, maxEntries?: number): Promise<ShuorenhuaCache | null>;
