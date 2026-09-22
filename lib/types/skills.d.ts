import type { Context } from '@deepseek-ai/cordis';
/**
 * Register the packaged shuorenhua skill provider on `ctx.skills`.
 * @param ctx - Cordis Context with `skills` available.
 * @returns disposer (effect; auto-cleaned on unload), or a noop when the
 *   skills service is unavailable.
 */
export declare function registerShuorenhuaSkills(ctx: Context): () => void;
