/**
 * Placeholder protector and restorer for markdown code blocks, inline code, math, and URLs.
 * Ensures that technical content, syntax, and links are never mangled by text rewrites.
 */

export interface ProtectedText {
  /** Text with placeholders in place of verbatim content. */
  text: string
  /** Map of placeholder keys to original verbatim content. */
  placeholders: Map<string, string>
}

/**
 * Protect code blocks, inline code, math blocks, and URLs by replacing them with unique placeholders.
 * @param input - Raw markdown or plain text.
 * @returns ProtectedText with placeholders map.
 */
export function protectVerbatim(input: string): ProtectedText {
  const placeholders = new Map<string, string>()
  let counter = 0
  let protectedContent = input

  // 1. Fenced Code blocks: ```...``` or ~~~...~~~
  protectedContent = protectedContent.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, (match) => {
    const key = `__SHUORENHUA_CODEBLOCK_${counter++}__`
    placeholders.set(key, match)
    return key
  })

  // 2. Math blocks: $$...$$ and inline math $...$
  // Note: match $$ first before single $
  protectedContent = protectedContent.replace(/(\$\$[\s\S]*?\$\$)/g, (match) => {
    const key = `__SHUORENHUA_DISP_MATH_${counter++}__`
    placeholders.set(key, match)
    return key
  })

  protectedContent = protectedContent.replace(/(\$[^$\n]+?\$)/g, (match) => {
    const key = `__SHUORENHUA_INLINE_MATH_${counter++}__`
    placeholders.set(key, match)
    return key
  })

  // 3. Inline code: `...`
  protectedContent = protectedContent.replace(/(`[^`\n]+?`)/g, (match) => {
    const key = `__SHUORENHUA_INLINECODE_${counter++}__`
    placeholders.set(key, match)
    return key
  })

  // 4. URLs: http:// or https://
  protectedContent = protectedContent.replace(/(https?:\/\/[^\s)>\]]+)/g, (match) => {
    const key = `__SHUORENHUA_URL_${counter++}__`
    placeholders.set(key, match)
    return key
  })

  return {
    text: protectedContent,
    placeholders,
  }
}

/**
 * Restore placeholders back to their original verbatim content.
 * Uses a function replacement in replaceAll to prevent $ characters in LaTeX/math/code from being treated as escape sequences.
 * @param text - Text containing placeholders.
 * @param placeholders - Map of placeholders to original content.
 * @returns Fully restored text.
 */
export function restoreVerbatim(text: string, placeholders: Map<string, string>): string {
  let result = text
  for (const [key, value] of placeholders.entries()) {
    result = result.replaceAll(key, () => value)
  }
  return result
}
