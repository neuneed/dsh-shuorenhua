/**
 * dsh-shuorenhua — Host plugin entry for DeepSeek Harness.
 *
 * Provides Host-side Typert RPC remote service and Agent tool for text humanization.
 */
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-typert-registry'
import { registerShuorenhuaTools, ShuorenhuaRuntime } from './runtime.ts'
import { TYPERT_MANIFEST } from './typert.ts'
import type { ShuorenhuaConfig } from './types.ts'

export const name = 'dsh-shuorenhua'
export const inject = ['typert', 'tools']

export interface Config {
  defaultMode?: string
  enableTool?: boolean
}

export const Config = z.object({
  defaultMode: z.string().default('natural'),
  enableTool: z.boolean().default(true),
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

  // 2. Register Typert RPC manifest
  ctx.effect(() => {
    let dispose: (() => Promise<void>) | (() => void) | undefined
    try {
      if (ctx.typert) {
        if (typeof (ctx.typert as any).register === 'function') {
          dispose = (ctx.typert as any).register(TYPERT_MANIFEST)
        } else if (ctx.typert.remotes && typeof ctx.typert.remotes.register === 'function') {
          dispose = ctx.typert.remotes.register(TYPERT_MANIFEST as any)
        }
      }
    } catch {
      // typert registry not available
    }
    return () => {
      if (dispose) void dispose()
    }
  }, 'dsh-shuorenhua: typert manifest')

  // 3. Register Agent tool if enabled
  if (resolved.enableTool !== false) {
    ctx.effect(
      () => registerShuorenhuaTools(ctx, resolved),
      'dsh-shuorenhua: agent tools',
    )
  }
}

export * from './engine/humanizer.ts'
export * from './runtime.ts'
export * from './types.ts'
