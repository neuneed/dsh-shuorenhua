/**
 * dsh-shuorenhua — Host plugin entry for DeepSeek Harness.
 *
 * Provides Host-side Typert RPC remote service and Agent tool for text humanization.
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export declare const name = "dsh-shuorenhua";
export declare const inject: string[];
export interface Config {
    defaultMode?: string;
    enableTool?: boolean;
}
export declare const Config: z<Schemastery.ObjectS<{
    defaultMode: z<string, string>;
    enableTool: z<boolean, boolean>;
}>, Schemastery.ObjectT<{
    defaultMode: z<string, string>;
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
