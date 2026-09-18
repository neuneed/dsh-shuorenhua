/**
 * Host Remote service & WebServer endpoints for dsh-shuorenhua.
 */
import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { humanize } from './engine/humanizer.ts'
import { HUMANIZER_SYSTEM_PROMPT } from './engine/prompt.ts'
import type { HumanizeResult, ShuorenhuaConfig } from './types.ts'

/**
 * Helper to execute LLM streaming generation for humanizing text.
 */
export async function* streamHumanize(
  ctx: Context,
  text: string,
  config: ShuorenhuaConfig = {},
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const llmService = ctx.get('llm')
  if (!llmService || typeof llmService.stream !== 'function') {
    throw new Error('DSH 宿主 LLM 服务未就绪，请检查模型提供方配置')
  }

  // 1. Resolve provider & model from config or active DSH default model
  let provider = config.provider
  let model = config.model

  // Safely query optional agentDefaultModel without triggering inject proxy trap
  const defaultModelService = ctx.get('agentDefaultModel')
  if ((!provider || !model) && defaultModelService && typeof defaultModelService.currentSelection === 'function') {
    try {
      const selection = defaultModelService.currentSelection()
      if (selection?.provider && !provider) {
        provider = selection.provider
      }
      if (selection?.model && !model) {
        model = selection.model
      }
    } catch {
      // ignore
    }
  }

  if (!provider && typeof llmService.listProviders === 'function') {
    try {
      const providers = llmService.listProviders()
      if (Array.isArray(providers) && providers.length > 0) {
        provider = providers[0]?.id
      }
    } catch {
      // ignore
    }
  }
  provider = provider || 'deepseek-official'

  if (!model && typeof llmService.listModels === 'function') {
    try {
      const models = await llmService.listModels(provider)
      if (Array.isArray(models) && models.length > 0) {
        model = models[0]?.id
      }
    } catch {
      // ignore model discovery error
    }
  }
  model = model || 'deepseek-chat'

  const stream = llmService.stream({
    provider,
    model,
    system: HUMANIZER_SYSTEM_PROMPT,
    messages: [
      {
        id: `msg-${Date.now()}` as any,
        role: 'user',
        source: { kind: 'user' },
        content: [{ type: 'text', text }],
      },
    ],
    temperature: 0.4,
    signal,
  })

  let hasYielded = false
  for await (const chunk of stream) {
    if (chunk.type === 'text-delta' && typeof chunk.text === 'string') {
      yield chunk.text
      hasYielded = true
    } else if (chunk.type === 'finish') {
      if (chunk.reason?.kind === 'error') {
        const failureMsg = chunk.reason.failure?.message || 'LLM 调用失败'
        throw new Error(`[${provider}/${model}] ${failureMsg}`)
      }
      if (chunk.reason?.kind === 'aborted') {
        return
      }
    }
  }

  if (!hasYielded && !signal?.aborted) {
    throw new Error(`[${provider}/${model}] 模型未返回任何生成文本，请检查提供方服务状态与模型配置`)
  }
}

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
   * Remote method to humanize text via AI.
   * @param text - The text to transform.
   * @returns HumanizeResult with simplified text and stats.
   */
  @Remote
  async humanize(text: string): Promise<HumanizeResult> {
    let assembled = ''
    try {
      for await (const delta of streamHumanize(this.ctx, text, this.config)) {
        assembled += delta
      }
    } catch (err: any) {
      throw new Error(err?.message || 'AI 润色生成失败')
    }

    if (!assembled.trim()) {
      throw new Error('AI 返回内容为空')
    }

    const originalLength = text.length
    const humanizedLength = assembled.length
    const savedPercentage = originalLength > 0
      ? Math.max(0, Math.round(((originalLength - humanizedLength) / originalLength) * 100))
      : 0

    return {
      text: assembled,
      original: text,
      mode: 'default',
      source: 'ai',
      stats: {
        originalLength,
        humanizedLength,
        savedPercentage,
        removedOpeners: 0,
        removedClosers: 0,
        replacedBuzzwords: 0,
      },
    }
  }
}

/**
 * Register webserver HTTP streaming route `/shuorenhua/stream`.
 * Enables the Client Web UI to stream AI rewrites in real time.
 */
export function registerShuorenhuaWebServer(
  ctx: Context,
  config: ShuorenhuaConfig = {},
): () => void {
  const webServer = ctx.get('webServer')
  if (!webServer || typeof webServer.register !== 'function') {
    return () => {}
  }

  return webServer.register({
    kind: 'exact',
    path: '/shuorenhua/stream',
    handler: async (req: any, res: any) => {
      // Handle CORS preflight if any
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
      }

      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      // Read JSON body
      let bodyText = ''
      try {
        for await (const chunk of req) {
          bodyText += chunk
          if (bodyText.length > 512 * 1024) {
            res.statusCode = 413
            res.end(JSON.stringify({ error: 'Payload too large' }))
            return
          }
        }
      } catch {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Failed to read request body' }))
        return
      }

      let text = ''
      try {
        const parsed = JSON.parse(bodyText)
        text = typeof parsed.text === 'string' ? parsed.text : ''
      } catch {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Invalid JSON body' }))
        return
      }

      if (!text.trim()) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.write(`data: ${JSON.stringify({ error: '待润色文本内容为空', done: true })}\n\n`)
        res.end()
        return
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const controller = new AbortController()
      req.on('close', () => {
        controller.abort()
      })

      try {
        for await (const delta of streamHumanize(ctx, text, config, controller.signal)) {
          if (controller.signal.aborted) break
          res.write(`data: ${JSON.stringify({ delta })}\n\n`)
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      } catch (err: any) {
        if (!controller.signal.aborted) {
          const errMsg = err?.message || 'AI 润色生成失败，请重试'
          res.write(`data: ${JSON.stringify({ error: errMsg, done: true })}\n\n`)
        }
      } finally {
        res.end()
      }
    },
  })
}

/**
 * Register DSH Agent tool for LLM self-simplification and user commands.
 */
export function registerShuorenhuaTools(
  ctx: Context,
  config: ShuorenhuaConfig = {},
): () => void {
  const toolsService = ctx.get('tools')
  if (!toolsService || typeof toolsService.register !== 'function') {
    return () => {}
  }

  return toolsService.register({
    name: 'shuorenhua_simplify',
    description:
      '把给定的AI回答、公文或冗长文本转化为通俗、简练、去除套话的人话。保留核心事实、数据与代码块，消除一切客套、开场白、结尾免责声明与八股大词。',
    parameters: {
      type: 'object',
      required: ['text'],
      properties: {
        text: {
          type: 'string',
          description: '需要转化为人话的文本内容。',
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
    presentCall: () => ({
      card: 'generic' as const,
      kind: 'transform' as const,
      title: '说人话润色',
    }),
    async execute(args: { text: string }) {
      const result = humanize(args.text)
      return {
        ok: true,
        simplified: result.text,
        stats: result.stats,
      }
    },
  })
}
