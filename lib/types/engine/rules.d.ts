/**
 * Rule definitions for dsh-shuorenhua.
 * Synthesized from:
 *   - MrGeDiao/shuorenhua (pruning empty conversational openers, closers, disclaimers)
 *   - op7418/Humanizer-zh (de-buzzwording, killing bureaucratic clichés)
 *   - nothing0here/humanizer-zh (natural rhythm, sentence structure de-bloat)
 */
/** Opening greeting regexes to strip. */
export declare const OPENING_GREETINGS: RegExp[];
/** Closing boilerplate and disclaimer regexes to strip. */
export declare const CLOSING_BOILERPLATES: RegExp[];
/** Buzzword mappings: bureaucratic/AI cliché -> plain natural word. */
export declare const BUZZWORD_REPLACEMENTS: Array<{
    pattern: RegExp;
    replacement: string;
    label: string;
}>;
/** Empty filler sentences inside text. */
export declare const FILLER_SENTENCES: RegExp[];
/** Meta-commentary and transition fillers to strip directly (MrGeDiao/shuorenhua). */
export declare const META_FILLERS: RegExp[];
/**
 * De-nominalization rules: convert bureaucratic "完成了对X的调整" into natural "调整了X" (MrGeDiao/shuorenhua).
 */
export declare function applyDenominalization(text: string): string;
/**
 * Strip repetitive echoes and circular restatements (MrGeDiao/shuorenhua).
 * e.g. "调整了重试策略。重试策略已经调整过了。" -> "调整了重试策略。"
 */
export declare function stripRepetitiveEchoes(text: string): string;
