/**
 * Core Humanizer Rule Engine (Offline/Local Fallback).
 * Transforms robotic, verbose, and buzzword-heavy AI text into clean, direct, human-friendly speech.
 */
import type { HumanizeOptions, HumanizeResult } from '../types.js';
/**
 * Humanize a given text using unified rules.
 * @param input - Original text to humanize.
 * @param options - Behavior options.
 * @returns HumanizeResult containing simplified text and metrics.
 */
export declare function humanize(input: string, options?: HumanizeOptions): HumanizeResult;
