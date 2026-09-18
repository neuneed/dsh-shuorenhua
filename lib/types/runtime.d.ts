/**
 * Host Remote service implementation for dsh-shuorenhua.
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { HumanizeResult, ShuorenhuaConfig } from './types.ts';
/**
 * Host service exporting the Shuorenhua RPC interface to Client plugins over Typert.
 */
export declare class ShuorenhuaRuntime extends TypertRemoteService {
    private readonly config;
    constructor(ctx: Context, config?: ShuorenhuaConfig);
    /**
     * Remote method to humanize/simplify text.
     * @param text - The text to transform.
     * @param mode - Optional mode ('natural' | 'concise' | 'code_first').
     * @returns HumanizeResult with simplified text and stats.
     */
    humanize(text: string, mode?: string): Promise<HumanizeResult>;
}
/**
 * Register DSH Agent tool for LLM self-simplification and user commands.
 * @param ctx - Cordis Context.
 * @param config - Resolved configuration.
 * @returns Disposer function.
 */
export declare function registerShuorenhuaTools(ctx: Context, config?: ShuorenhuaConfig): () => void;
