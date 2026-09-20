/**
 * Host Remote service & WebServer endpoints for dsh-shuorenhua.
 */
import type { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { humanize } from './engine/humanizer.js'
import { HUMANIZER_SYSTEM_PROMPT } from './engine/prompt.js'
import type { HumanizeResult, ShuorenhuaConfig } from './types.js'
import {
  humanizeCacheKey,
  isFreshCacheRecord,
  type ShuorenhuaCacheHolder,
} from './cache.js'

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

/** Shared leak-free response helpers for the streaming and cache routes. */

/** Reject cross-origin POSTs; returns `true` when the request was already answered. */
function rejectCrossOrigin(req: any, res: any): boolean {
  // Same-origin guard: the Web UI calls these routes same-origin (no CORS
  // headers are sent). Browsers set `Origin` on every POST; a mismatching
  // origin is a third-party page trying to reach these LLM-backed endpoints.
  // Non-browser clients (curl) send no Origin and pass.
  const origin = req.headers?.origin
  if (origin) {
    let originHost: string | undefined
    try {
      originHost = new URL(origin).hostname
    } catch {
      originHost = undefined
    }
    const ownHost = (req.headers?.host ?? '').split(':')[0]
    if (!ownHost || !originHost || originHost !== ownHost) {
      res.statusCode = 403
      res.end(JSON.stringify({ error: 'Cross-origin request rejected' }))
      return true
    }
  }
  return false
}

/** Read and JSON-parse a POST body; writes the error response and returns `null` on failure. */
async function readJsonBody(req: any, res: any): Promise<Record<string, unknown> | null> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return null
  }
  let bodyText = ''
  try {
    for await (const chunk of req) {
      bodyText += chunk
      if (bodyText.length > 512 * 1024) {
        res.statusCode = 413
        res.end(JSON.stringify({ error: 'Payload too large' }))
        return null
      }
    }
  } catch {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'Failed to read request body' }))
    return null
  }
  try {
    const parsed = JSON.parse(bodyText)
    return parsed && typeof parsed === 'object'
      ? parsed as Record<string, unknown>
      : {}
  } catch {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'Invalid JSON body' }))
    return null
  }
}

/**
 * Register webserver HTTP routes for dsh-shuorenhua:
 *   - `/shuorenhua/stream`      SSE rewrite streaming (LLM-backed)
 *   - `/shuorenhua/cache/read`  cached-rewrite lookup (no LLM involved)
 * @param ctx - Cordis Context with `webServer` available.
 * @param config - Plugin configuration.
 * @param cacheRef - Holder updated once the storage-domain cache mounts; drives
 * the cache read/write paths. Safe to keep the default (cache simply off).
 */
export function registerShuorenhuaWebServer(
  ctx: Context,
  config: ShuorenhuaConfig = {},
  cacheRef: ShuorenhuaCacheHolder = { current: null },
): () => void {
  const webServer = ctx.get('webServer')
  if (!webServer || typeof webServer.register !== 'function') {
    return () => {}
  }

  const disposers: Array<() => void> = []

  // 1. Cache-read endpoint: returns the persisted rewrite for (messageId, text)
  disposers.push(webServer.register({
    kind: 'exact',
    path: '/shuorenhua/cache/read',
    handler: async (req: any, res: any) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      if (rejectCrossOrigin(req, res)) return
      const body = await readJsonBody(req, res)
      if (!body) return
      const text = typeof body.text === 'string' ? body.text : ''
      const messageId = typeof body.messageId === 'string' ? body.messageId : undefined

      const record = cacheRef.current?.read(humanizeCacheKey(messageId, text))
      if (isFreshCacheRecord(record, text)) {
        res.statusCode = 200
        res.end(JSON.stringify({ cached: true, text: record.text }))
        return
      }
      res.statusCode = 200
      res.end(JSON.stringify({ cached: false, text: null }))
    },
  }))

  // 2. SSE rewrite streaming endpoint
  disposers.push(webServer.register({
    kind: 'exact',
    path: '/shuorenhua/stream',
    handler: async (req: any, res: any) => {
      if (rejectCrossOrigin(req, res)) return
      const body = await readJsonBody(req, res)
      if (!body) return
      const text = typeof body.text === 'string' ? body.text : ''
      const messageId = typeof body.messageId === 'string' ? body.messageId : undefined

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

      let assembled = ''
      try {
        for await (const delta of streamHumanize(ctx, text, config, controller.signal)) {
          if (controller.signal.aborted) break
          assembled += delta
          res.write(`data: ${JSON.stringify({ delta })}\n\n`)
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`)

        // Persist a successful rewrite for this exact message + source text.
        if (!controller.signal.aborted && assembled.trim()) {
          const cache = cacheRef.current
          if (cache) {
            void cache
              .persist(humanizeCacheKey(messageId, text), {
                original: text,
                text: assembled,
                ts: Date.now(),
              })
              .catch(() => {
                // Cache writes are best-effort; never break the stream response.
              })
          }
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          const errMsg = err?.message || 'AI 润色生成失败，请重试'
          res.write(`data: ${JSON.stringify({ error: errMsg, done: true })}\n\n`)
        }
      } finally {
        res.end()
      }
    },
  }))

  return () => {
    for (const dispose of disposers) dispose()
  }
}

/**
 * Register DSH Agent tool for LLM self-simplification and user commands.
 * The tool uses LLM generation when available, with a fast offline rule engine fallback.
 */
export function registerShuorenhuaTools(ctx: Context, config: ShuorenhuaConfig = {}): () => void {
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
      card: 'generic',
      kind: 'other',
      title: '说人话润色',
    }),
    async execute(args: { text: string }) {
      const rawText = args.text ?? ''

      // 1. Try LLM generation if llm service is active
      const llmService = ctx.get('llm')
      if (llmService && typeof llmService.stream === 'function') {
        try {
          let assembled = ''
          for await (const chunk of streamHumanize(ctx, rawText, config)) {
            assembled += chunk
          }
          if (assembled.trim()) {
            const originalLength = rawText.length
            const humanizedLength = assembled.length
            const savedPercentage = originalLength > 0
              ? Math.max(0, Math.round(((originalLength - humanizedLength) / originalLength) * 100))
              : 0
            return {
              ok: true,
              simplified: assembled.trim(),
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
        } catch {
          // Gracefully fallback to rule engine
        }
      }

      // 2. Offline / local rule engine fallback
      const result = humanize(rawText)
      return {
        ok: true,
        simplified: result.text,
        stats: result.stats,
      }
    },
  })
}
