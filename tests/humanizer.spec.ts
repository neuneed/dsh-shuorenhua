import { describe, expect, it } from 'vitest'
import { humanize } from '../src/engine/humanizer.ts'

describe('humanizer', () => {
  it('handles empty input gracefully', () => {
    const res = humanize('')
    expect(res.text).toBe('')
    expect(res.stats.originalLength).toBe(0)
    expect(res.stats.humanizedLength).toBe(0)
  })

  it('humanizes AI greeting and closing in natural mode', () => {
    const input = `好的，很高兴为您解答！针对您提出的关于跨域的问题：

可以通过设置 CORS 响应头 \`Access-Control-Allow-Origin: *\` 来解决。

希望以上解答对您有所帮助！如果您还有其他疑问，欢迎随时向我提问！`

    const res = humanize(input, { mode: 'natural' })

    // Openers & closers stripped
    expect(res.text).not.toContain('好的，很高兴为您解答')
    expect(res.text).not.toContain('希望以上解答对您有所帮助')
    expect(res.text).not.toContain('欢迎随时向我提问')

    // Essential answer preserved
    expect(res.text).toContain('Access-Control-Allow-Origin: *')

    // Metrics
    expect(res.stats.removedOpeners).toBeGreaterThan(0)
    expect(res.stats.removedClosers).toBeGreaterThan(0)
    expect(res.stats.savedPercentage).toBeGreaterThan(0)
  })

  it('replaces buzzwords and preserves code blocks intact in concise mode', () => {
    const input = `这是一个非常好的问题！
随着数字技术的飞速发展，我们需要赋能开发者并找到核心抓手，形成闭环。

首先，安装依赖：
\`\`\`bash
pnpm add @deepseek-ai/cordis
\`\`\`

其次，配置入口。

总而言之，毋庸置疑这是最佳实践。`

    const res = humanize(input, { mode: 'concise' })

    // Code block preserved
    expect(res.text).toContain('pnpm add @deepseek-ai/cordis')
    // Openers stripped
    expect(res.text).not.toContain('这是一个非常好的问题')
    // Buzzwords transformed
    expect(res.text).not.toContain('赋能')
    expect(res.text).not.toContain('抓手')
    expect(res.text).not.toContain('闭环')
    // Transitions simplified
    expect(res.text).toContain('1. 安装依赖')
    expect(res.text).toContain('2. 配置入口')
  })

  it('extracts actionable points in code_first mode', () => {
    const input = `好的，我来为您解答。在当今数字化时代，配置 Nginx 非常重要。

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
}
\`\`\`

- 执行 \`nginx -t\` 验证语法
- 执行 \`systemctl reload nginx\` 重载服务

希望对您有所帮助！`

    const res = humanize(input, { mode: 'code_first' })
    expect(res.text).toContain('server {')
    expect(res.text).toContain('nginx -t')
    expect(res.text).toContain('systemctl reload nginx')
    expect(res.text).not.toContain('好的，我来为您解答')
    expect(res.text).not.toContain('希望对您有所帮助')
  })
})
