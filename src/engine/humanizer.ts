/**
 * Core Humanizer Engine.
 * Transforms robotic, verbose, and buzzword-heavy AI text into clean, direct, human-friendly speech.
 */

import type { HumanizeMode, HumanizeOptions, HumanizeResult, HumanizeStats } from '../types.ts'
import { protectVerbatim, restoreVerbatim } from './placeholders.ts'
import {
  BUZZWORD_REPLACEMENTS,
  CLOSING_BOILERPLATES,
  FILLER_SENTENCES,
  OPENING_GREETINGS,
} from './rules.ts'

/**
 * Humanize a given text with the specified mode and options.
 * @param input - Original text to humanize.
 * @param options - Mode and behavior options.
 * @returns HumanizeResult containing simplified text and metrics.
 */
export function humanize(input: string, options: HumanizeOptions = {}): HumanizeResult {
  const mode: HumanizeMode = options.mode ?? 'natural'
  const rawInput = input ?? ''
  if (!rawInput.trim()) {
    return {
      text: '',
      original: rawInput,
      mode,
      stats: {
        originalLength: 0,
        humanizedLength: 0,
        savedPercentage: 0,
        removedOpeners: 0,
        removedClosers: 0,
        replacedBuzzwords: 0,
      },
    }
  }

  // 1. Protect code blocks, math, inline code, and URLs
  const { text: protectedContent, placeholders } = protectVerbatim(rawInput)
  let processed = protectedContent.trim()
  let removedOpeners = 0
  let removedClosers = 0
  let replacedBuzzwords = 0

  // 2. Iteratively strip opening greetings until none remain
  let openerMatched = true
  while (openerMatched) {
    openerMatched = false
    for (const regex of OPENING_GREETINGS) {
      if (regex.test(processed)) {
        processed = processed.replace(regex, '').trim()
        removedOpeners++
        openerMatched = true
      }
    }
  }

  // 3. Iteratively strip closing boilerplates until none remain
  let closerMatched = true
  while (closerMatched) {
    closerMatched = false
    for (const regex of CLOSING_BOILERPLATES) {
      if (regex.test(processed)) {
        processed = processed.replace(regex, '').trim()
        removedClosers++
        closerMatched = true
      }
    }
  }

  // 4. Strip filler sentences
  for (const regex of FILLER_SENTENCES) {
    if (regex.test(processed)) {
      processed = processed.replaceAll(regex, '')
    }
  }

  // 5. Replace buzzwords
  for (const item of BUZZWORD_REPLACEMENTS) {
    const matches = processed.match(item.pattern)
    if (matches && matches.length > 0) {
      replacedBuzzwords += matches.length
      processed = processed.replaceAll(item.pattern, item.replacement)
    }
  }

  // 6. Mode-specific adjustments
  if (mode === 'concise') {
    // Break mechanical tripartite openers into crisp points
    processed = processed
      .replace(/(^|\n)首先[，,]?\s*/g, '$11. ')
      .replace(/(^|\n)其次[，,]?\s*/g, '$12. ')
      .replace(/(^|\n)再次[，,]?\s*/g, '$13. ')
      .replace(/(^|\n)最后[，,]?\s*/g, '$14. ')
      .replace(/(^|\n)第一[，、]?\s*/g, '$11. ')
      .replace(/(^|\n)第二[，、]?\s*/g, '$12. ')
      .replace(/(^|\n)第三[，、]?\s*/g, '$13. ')

    // Remove redundant transitional clutter
    processed = processed
      .replace(/[，,]?(总的来说|总而言之|综上所述)[，,]?/g, '')
      .replace(/[，,]?(显而易见|毋庸置疑)[，,]?/g, '')
  } else if (mode === 'code_first') {
    // If the text contains code block placeholders, emphasize code & steps
    const lines = processed.split('\n')
    const filteredLines: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.includes('__SHUORENHUA_CODEBLOCK_')) {
        filteredLines.push(line)
        continue
      }
      // Keep markdown headings, list items, tables, and short concise directives
      if (
        trimmed.startsWith('#') ||
        trimmed.startsWith('-') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('|') ||
        /^\d+\./.test(trimmed) ||
        trimmed.endsWith(':') ||
        trimmed.endsWith('：') ||
        trimmed.includes('`') ||
        trimmed.includes('__SHUORENHUA_')
      ) {
        filteredLines.push(line)
      } else if (trimmed.length > 0 && trimmed.length < 80) {
        // Keep concise explanatory lines
        filteredLines.push(line)
      }
    }

    if (filteredLines.length > 0) {
      processed = filteredLines.join('\n')
    }
  }

  // Clean excessive blank lines (more than 2 consecutive newlines)
  processed = processed.replace(/\n{3,}/g, '\n\n').trim()

  // 7. Restore code blocks and verbatim elements
  const finalResult = restoreVerbatim(processed, placeholders)

  const originalLength = rawInput.length
  const humanizedLength = finalResult.length
  const savedRatio = originalLength > 0
    ? Math.max(0, Math.round(((originalLength - humanizedLength) / originalLength) * 100))
    : 0

  const stats: HumanizeStats = {
    originalLength,
    humanizedLength,
    savedPercentage: savedRatio,
    removedOpeners,
    removedClosers,
    replacedBuzzwords,
  }

  return {
    text: finalResult,
    original: rawInput,
    mode,
    stats,
  }
}
