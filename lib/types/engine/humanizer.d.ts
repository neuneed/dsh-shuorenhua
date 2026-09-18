/**
 * Core Humanizer Engine.
 * Transforms robotic, verbose, and buzzword-heavy AI text into clean, direct, human-friendly speech.
 */
import type { HumanizeOptions, HumanizeResult } from '../types.ts';
/**
 * Humanize a given text with the specified mode and options.
 * @param input - Original text to humanize.
 * @param options - Mode and behavior options.
 * @returns HumanizeResult containing simplified text and metrics.
 */
export declare function humanize(input: string, options?: HumanizeOptions): HumanizeResult;
