import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { ShuorenhuaRuntime } from '../src/runtime.ts'

describe('ShuorenhuaRuntime', () => {
  it('calls humanize method over Typert service instance', async () => {
    const ctx = new Context()
    ctx.provide('llm', {
      listProviders: () => [{ id: 'mock-provider', name: 'Mock' }],
      listModels: () => [{ id: 'mock-model', name: 'Mock Model' }],
      async *stream() {
        yield { type: 'text-delta', text: '我们可以帮助业务并搞定。' }
      },
    } as any)
    const runtime = new ShuorenhuaRuntime(ctx)

    const res = await runtime.humanize(
      '好的，很高兴为您解答！我们可以赋能业务并完成闭环。希望对您有所帮助！',
    )

    expect(res.text).toContain('帮助')
    expect(res.text).toContain('搞定')
    expect(res.source).toBe('ai')
  })

  it('streamHumanize reads agentDefaultModel without throwing inject error', async () => {
    const ctx = new Context()
    ctx.provide('llm', {
      async *stream(options: any) {
        expect(options.provider).toBe('custom-provider')
        expect(options.model).toBe('custom-model')
        yield { type: 'text-delta', text: '你好' }
      },
    } as any)
    ctx.provide('agentDefaultModel', {
      currentSelection: () => ({ provider: 'custom-provider', model: 'custom-model' }),
    } as any)

    const runtime = new ShuorenhuaRuntime(ctx)
    const res = await runtime.humanize('测试文本')
    expect(res.text).toBe('你好')
  })

  it('streamHumanize works cleanly when agentDefaultModel is completely absent', async () => {
    const ctx = new Context()
    ctx.provide('llm', {
      listProviders: () => [{ id: 'fallback-p', name: 'Fallback' }],
      listModels: () => [{ id: 'fallback-m', name: 'Fallback M' }],
      async *stream(options: any) {
        expect(options.provider).toBe('fallback-p')
        expect(options.model).toBe('fallback-m')
        yield { type: 'text-delta', text: '大白话' }
      },
    } as any)

    const runtime = new ShuorenhuaRuntime(ctx)
    const res = await runtime.humanize('测试文本')
    expect(res.text).toBe('大白话')
  })
})
