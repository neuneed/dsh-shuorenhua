/**
 * dsh-shuorenhua — Host plugin entry for DeepSeek Harness.
 *
 * Provides Host-side Typert RPC remote service, streaming WebServer route, and Agent tool.
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export declare const name = "dsh-shuorenhua";
export interface Config {
    provider?: string;
    model?: string;
    enableTool?: boolean;
    /** Durable per-message humanize cache (via ctx.storageDomain). Default: true. */
    enableCache?: boolean;
    /** Soft LRU cap on cached rewrites. Default: 100. */
    cacheMaxEntries?: number;
}
export declare const Config: z<Schemastery.ObjectS<{
    provider: z<string, string>;
    model: z<string, string>;
    enableTool: z<boolean, boolean>;
    enableCache: z<boolean, boolean>;
    cacheMaxEntries: z<number, number>;
}>, Schemastery.ObjectT<{
    provider: z<string, string>;
    model: z<string, string>;
    enableTool: z<boolean, boolean>;
    enableCache: z<boolean, boolean>;
    cacheMaxEntries: z<number, number>;
}>>;
/**
 * Apply the Host-side Shuorenhua plugin to the Cordis Context.
 * @param ctx - Cordis Context.
 * @param config - Plugin configuration.
 */
export declare function apply(ctx: Context, config?: Config): void;
export * from './engine/humanizer.js';
export * from './runtime.js';
export * from './types.js';
