/**
 * dsh-shuorenhua — Host plugin entry for DeepSeek Harness.
 *
 * Provides Host-side Typert RPC remote service, streaming WebServer route, and Agent tool.
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export declare const name = "dsh-shuorenhua";
export declare const inject: string[];
export interface Config {
    provider?: string;
    model?: string;
    enableTool?: boolean;
}
export declare const Config: z<Schemastery.ObjectS<{
    provider: z<string, string>;
    model: z<string, string>;
    enableTool: z<boolean, boolean>;
}>, Schemastery.ObjectT<{
    provider: z<string, string>;
    model: z<string, string>;
    enableTool: z<boolean, boolean>;
}>>;
/**
 * Apply the Host-side Shuorenhua plugin to the Cordis Context.
 * @param ctx - Cordis Context.
 * @param config - Plugin configuration.
 */
export declare function apply(ctx: Context, config?: Config): void;
export * from './engine/humanizer.ts';
export * from './runtime.ts';
export * from './types.ts';
