import { describe, expect, it } from 'vitest'
import { protectVerbatim, restoreVerbatim } from '../src/engine/placeholders.ts'

describe('placeholders', () => {
  it('protects and restores code blocks verbatim', () => {
    const input = `这是一个测试：
\`\`\`python
def hello():
    # 赋能 与 闭环
    print("hello world https://example.com")
\`\`\`
代码结束。`

    const { text, placeholders } = protectVerbatim(input)
    expect(text).toContain('__SHUORENHUA_CODEBLOCK_0__')
    expect(text).not.toContain('def hello')

    const restored = restoreVerbatim(text, placeholders)
    expect(restored).toBe(input)
  })

  it('protects inline code and URLs', () => {
    const input = '请运行 `npm install` 并访问 https://deepseek.com 查看文档。'
    const { text, placeholders } = protectVerbatim(input)
    expect(text).toContain('__SHUORENHUA_INLINECODE_0__')
    expect(text).toContain('__SHUORENHUA_URL_1__')

    const restored = restoreVerbatim(text, placeholders)
    expect(restored).toBe(input)
  })

  it('protects math formulas', () => {
    const input = '公式为 $$E = mc^2$$ 以及行内公式 $a^2 + b^2 = c^2$。'
    const { text, placeholders } = protectVerbatim(input)
    expect(text).toContain('__SHUORENHUA_DISP_MATH_0__')
    expect(text).toContain('__SHUORENHUA_INLINE_MATH_1__')

    const restored = restoreVerbatim(text, placeholders)
    expect(restored).toBe(input)
  })
})
