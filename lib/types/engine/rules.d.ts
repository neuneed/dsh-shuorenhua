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
