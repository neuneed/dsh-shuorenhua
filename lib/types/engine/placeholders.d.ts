/**
 * Placeholder protector and restorer for markdown code blocks, inline code, math, and URLs.
 * Ensures that technical content, syntax, and links are never mangled by text rewrites.
 */
export interface ProtectedText {
    /** Text with placeholders in place of verbatim content. */
    text: string;
    /** Map of placeholder keys to original verbatim content. */
    placeholders: Map<string, string>;
}
/**
 * Protect code blocks, inline code, math blocks, and URLs by replacing them with unique placeholders.
 * @param input - Raw markdown or plain text.
 * @returns ProtectedText with placeholders map.
 */
export declare function protectVerbatim(input: string): ProtectedText;
/**
 * Restore placeholders back to their original verbatim content.
 * Uses a function replacement in replaceAll to prevent $ characters in LaTeX/math/code from being treated as escape sequences.
 * @param text - Text containing placeholders.
 * @param placeholders - Map of placeholders to original content.
 * @returns Fully restored text.
 */
export declare function restoreVerbatim(text: string, placeholders: Map<string, string>): string;
