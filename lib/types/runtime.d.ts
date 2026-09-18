/**
 * Host Remote service & WebServer endpoints for dsh-shuorenhua.
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { HumanizeResult, ShuorenhuaConfig } from './types.ts';
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
     * Remote method to humanize text (supporting real AI generation with fallback).
     * @param text - The text to transform.
     * @returns HumanizeResult with simplified text and stats.
     */
    humanize(text: string): Promise<HumanizeResult>;
}
/**
 * Register webserver HTTP streaming route `/api/shuorenhua/stream`.
 * Enables the Client Web UI to stream AI rewrites in real time.
 */
export declare function registerShuorenhuaWebServer(ctx: Context, config?: ShuorenhuaConfig): () => void;
/**
 * Register DSH Agent tool for LLM self-simplification and user commands.
 */
export declare function registerShuorenhuaTools(ctx: Context, config?: ShuorenhuaConfig): () => void;
