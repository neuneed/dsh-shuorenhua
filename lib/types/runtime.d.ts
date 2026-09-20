/**
 * Host Remote service & WebServer endpoints for dsh-shuorenhua.
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { HumanizeResult, ShuorenhuaConfig } from './types.js';
import { type ShuorenhuaCacheHolder } from './cache.js';
/**
 * Helper to execute LLM streaming generation for humanizing text.
 */
export declare function streamHumanize(ctx: Context, text: string, config?: ShuorenhuaConfig, signal?: AbortSignal): AsyncGenerator<string, void, unknown>;
/**
 * Host service exporting the Shuorenhua RPC interface to Client plugins over Typert.
 */
export declare class ShuorenhuaRuntime extends TypertRemoteService {
    private readonly config;
    constructor(ctx: Context, config?: ShuorenhuaConfig);
    /**
     * Remote method to humanize text via AI.
     * @param text - The text to transform.
     * @returns HumanizeResult with simplified text and stats.
     */
    humanize(text: string): Promise<HumanizeResult>;
}
/**
 * Register webserver HTTP routes for dsh-shuorenhua:
 *   - `/shuorenhua/stream`      SSE rewrite streaming (LLM-backed)
 *   - `/shuorenhua/cache/read`  cached-rewrite lookup (no LLM involved)
 * @param ctx - Cordis Context with `webServer` available.
 * @param config - Plugin configuration.
 * @param cacheRef - Holder updated once the storage-domain cache mounts; drives
 * the cache read/write paths. Safe to keep the default (cache simply off).
 */
export declare function registerShuorenhuaWebServer(ctx: Context, config?: ShuorenhuaConfig, cacheRef?: ShuorenhuaCacheHolder): () => void;
/**
 * Register DSH Agent tool for LLM self-simplification and user commands.
 * The tool runs the local rule engine, so it needs no LLM config.
 */
export declare function registerShuorenhuaTools(ctx: Context): () => void;
