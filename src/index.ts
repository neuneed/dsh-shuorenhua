/**
 * dsh-shuorenhua — Host plugin entry for DeepSeek Harness.
 *
 * Provides Host-side Typert RPC remote service, streaming WebServer route, and Agent tool.
 */
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-typert-registry'
import { registerShuorenhuaTools, registerShuorenhuaWebServer, ShuorenhuaRuntime } from './runtime.js'
import { TYPERT_MANIFEST } from './typert.js'
import type { ShuorenhuaConfig } from './types.js'
import { openShuorenhuaCache, type ShuorenhuaCacheHolder } from './cache.js'

export const name = 'dsh-shuorenhua'
// No top-level inject: `llm` is optional (probing via ctx.get in streamHumanize),
// and the rule-based tool works without any LLM provider.

export interface Config {
  provider?: string
  model?: string
  enableTool?: boolean
  /** Durable per-message humanize cache (via ctx.storageDomain). Default: true. */
  enableCache?: boolean
  /** Soft LRU cap on cached rewrites. Default: 100. */
  cacheMaxEntries?: number
}

export const Config = z.object({
  provider: z.string(),
  model: z.string(),
  enableTool: z.boolean().default(true),
  enableCache: z.boolean().default(true),
  cacheMaxEntries: z.number().default(100),
})

/**
 * Apply the Host-side Shuorenhua plugin to the Cordis Context.
 * @param ctx - Cordis Context.
 * @param config - Plugin configuration.
 */
export function apply(ctx: Context, config?: Config): void {
  const resolved = Config(config ?? {}) as ShuorenhuaConfig

  // 1. Instantiate the Host-side Typert service
  new ShuorenhuaRuntime(ctx, resolved)

  // 2. Register Typert RPC manifest when typert service is available
  ctx.inject(['typert'], (typertCtx) => {
    typertCtx.effect(() => {
      let dispose: (() => Promise<void>) | (() => void) | undefined
      try {
        const typert = typertCtx.get('typert')
        if (typert) {
          if (typeof (typert as any).register === 'function') {
            dispose = (typert as any).register(TYPERT_MANIFEST)
          } else if (typert.remotes && typeof (typert.remotes as any).register === 'function') {
            dispose = (typert.remotes as any).register(TYPERT_MANIFEST as any)
          }
        }
      } catch {
        // typert registry not available
      }
      return () => {
        if (dispose) void dispose()
      }
    }, 'dsh-shuorenhua: typert manifest')
  })

  // 3. Register HTTP routes on webServer (/shuorenhua/stream, /shuorenhua/cache/read)
  const cacheHolder: ShuorenhuaCacheHolder = { current: null }

  // Optional: durable per-message cache backed by ctx.storageDomain
  if (resolved.enableCache !== false) {
    ctx.inject(['storageDomain'], (cacheCtx) => {
      cacheCtx.effect(
        async () => {
          const cache = await openShuorenhuaCache(cacheCtx, resolved.cacheMaxEntries ?? 100)
          if (!cache) return () => {} // storage seat unavailable: noop disposer
          cacheHolder.current = cache
          return () => {
            cacheHolder.current = null
            void cache.close().catch(() => {
              // best-effort close; the facility also closes leftovers on unmount
            })
          }
        },
        'dsh-shuorenhua: humanize cache',
      )
    })
  }

  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(
      () => registerShuorenhuaWebServer(webCtx, resolved, cacheHolder),
      'dsh-shuorenhua: webserver route',
    )
  })

  // 4. Register Agent tool when tools service is available
  if (resolved.enableTool !== false) {
    ctx.inject(['tools'], (toolCtx) => {
      toolCtx.effect(
        () => registerShuorenhuaTools(toolCtx, resolved),
        'dsh-shuorenhua: agent tools',
      )
    })
  }
}

export * from './engine/humanizer.js'
export * from './runtime.js'
export * from './types.js'
