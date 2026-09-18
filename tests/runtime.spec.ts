import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { ShuorenhuaRuntime } from '../src/runtime.ts'

describe('ShuorenhuaRuntime', () => {
  it('calls humanize method over Typert service instance', async () => {
    const ctx = new Context()
    const runtime = new ShuorenhuaRuntime(ctx)

    const res = await runtime.humanize(
      '好的，很高兴为您解答！我们可以赋能业务并完成闭环。希望对您有所帮助！',
    )

    expect(res.text).not.toContain('很高兴为您解答')
    expect(res.text).not.toContain('希望对您有所帮助')
    expect(res.text).toContain('帮助')
    expect(res.text).toContain('搞定')
    expect(res.stats.removedOpeners).toBeGreaterThan(0)
    expect(res.stats.removedClosers).toBeGreaterThan(0)
  })
})
