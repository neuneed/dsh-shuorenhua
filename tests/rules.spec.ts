import { describe, expect, it } from 'vitest'
import {
  BUZZWORD_REPLACEMENTS,
  CLOSING_BOILERPLATES,
  OPENING_GREETINGS,
} from '../src/engine/rules.ts'

describe('rules', () => {
  it('matches common opening greetings', () => {
    const cases = [
      '好的，我来为您解答这个问题。',
      '很高兴为您解答！关于React组件...',
      '收到您的提问，针对您提出的需求...',
      '这是一个非常好的问题！',
      '在当今飞速发展的数字化浪潮中，我们必须...',
    ]

    for (const c of cases) {
      const matched = OPENING_GREETINGS.some(regex => regex.test(c))
      expect(matched).toBe(true)
    }
  })

  it('matches common closing boilerplates', () => {
    const cases = [
      '希望以上解答对您有所帮助！',
      '如果您还有任何疑问，欢迎随时向我提问！',
      '请根据您的实际情况进行调整。',
      '总而言之，保持代码整洁很重要。',
    ]

    for (const c of cases) {
      const matched = CLOSING_BOILERPLATES.some(regex => regex.test(c))
      expect(matched).toBe(true)
    }
  })

  it('replaces buzzwords with plain language equivalents', () => {
    let sample = '我们要赋能业务，找到抓手，形成闭环，深耕垂直领域，沉淀底层逻辑与顶层设计，提升颗粒度，毋庸置疑这是关键所在。'
    for (const item of BUZZWORD_REPLACEMENTS) {
      sample = sample.replaceAll(item.pattern, item.replacement)
    }

    expect(sample).not.toContain('赋能')
    expect(sample).not.toContain('抓手')
    expect(sample).not.toContain('闭环')
    expect(sample).not.toContain('深耕')
    expect(sample).not.toContain('底层逻辑')
    expect(sample).not.toContain('顶层设计')
    expect(sample).not.toContain('颗粒度')
    expect(sample).not.toContain('毋庸置疑')

    expect(sample).toContain('帮助')
    expect(sample).toContain('切入点')
    expect(sample).toContain('搞定')
    expect(sample).toContain('专注')
    expect(sample).toContain('基本原理')
    expect(sample).toContain('总体规划')
    expect(sample).toContain('细节程度')
    expect(sample).toContain('显然')
  })
})
