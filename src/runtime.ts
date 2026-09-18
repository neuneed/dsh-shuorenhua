/**
 * Host Remote service implementation for dsh-shuorenhua.
 */
import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { humanize } from './engine/humanizer.ts'
import type { HumanizeMode, HumanizeResult, ShuorenhuaConfig } from './types.ts'

/**
 * Host service exporting the Shuorenhua RPC interface to Client plugins over Typert.
 */
export class ShuorenhuaRuntime extends TypertRemoteService {
  constructor(
    ctx: Context,
    private readonly config: ShuorenhuaConfig = {},
  ) {
    super(ctx, 'shuorenhua')
  }

  /**
   * Remote method to humanize/simplify text.
   * @param text - The text to transform.
   * @param mode - Optional mode ('natural' | 'concise' | 'code_first').
   * @returns HumanizeResult with simplified text and stats.
   */
  @Remote
  async humanize(text: string, mode?: string): Promise<HumanizeResult> {
    const selectedMode = (mode as HumanizeMode) || this.config.defaultMode || 'natural'
    return humanize(text, { mode: selectedMode })
  }
}

/**
 * Register DSH Agent tool for LLM self-simplification and user commands.
 * @param ctx - Cordis Context.
 * @param config - Resolved configuration.
 * @returns Disposer function.
 */
export function registerShuorenhuaTools(
  ctx: Context,
  config: ShuorenhuaConfig = {},
): () => void {
  // Check if tools service is available on ctx
  let toolsService: any = null
  try {
    toolsService = (ctx.reflect as any)?.get('tools') ?? (ctx as any).tools
  } catch {
    // tools service not available
  }
  if (!toolsService || typeof toolsService.register !== 'function') {
    return () => {}
  }

  return toolsService.register({
    name: 'shuorenhua_simplify',
    description:
      '把给定的AI回答、公文或冗长文本转化为通俗、简练、去除套话的人话。支持三种模式：natural（自然人话，消除公文味与八股词）、concise（极简大白话，直击要点）、code_first（程序员直球，优先保留代码、命令与排查步骤）。',
    parameters: {
      type: 'object',
      required: ['text'],
      properties: {
        text: {
          type: 'string',
          description: '需要转化为人话的文本内容。',
        },
        mode: {
          type: 'string',
          enum: ['natural', 'concise', 'code_first'],
          description: '转化模式：natural（自然人话，默认）、concise（极简大白话）、code_first（程序员直球）。',
        },
      },
    },
    output: {
      schema: { type: 'object' },
      render: (_args: unknown, value: unknown) => [
        { type: 'text', text: JSON.stringify(value, null, 2) },
      ],
    },
    isConcurrencySafe: () => true,
    presentCall: (args: { text?: string; mode?: string }) => ({
      card: 'generic' as const,
      kind: 'transform' as const,
      title: `说人话润色 (${args?.mode || config.defaultMode || 'natural'})`,
    }),
    async execute(args: { text: string; mode?: HumanizeMode }) {
      const mode = args.mode || config.defaultMode || 'natural'
      const result = humanize(args.text, { mode })
      return {
        ok: true,
        simplified: result.text,
        mode: result.mode,
        stats: result.stats,
      }
    },
  })
}
