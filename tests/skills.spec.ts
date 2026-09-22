import { describe, it, expect } from 'vitest'
import { registerShuorenhuaSkills } from '../src/skills.js'
import type { SkillCandidate, SkillDefinition, SkillProvider } from '@deepseek-ai/dsh-skill'

/** Minimal mock context: captures the registered provider and exposes a logger. */
function mockCtx(skillsAvailable = true): { ctx: any; provider: SkillProvider | null } {
  let provider: SkillProvider | null = null
  const ctx = {
    logger: { warn: () => {} },
    get: (name: string) => {
      if (name !== 'skills' || !skillsAvailable) return undefined
      return {
        registerProvider: (factory: (ctrl: any) => SkillProvider) => {
          provider = factory({ signal: new AbortController().signal, invalidate: () => {} })
          return () => { provider = null }
        },
      }
    },
  }
  return { ctx, provider: () => provider } as any
}

describe('registerShuorenhuaSkills', () => {
  it('registers the shuorenhua-skills provider on ctx.skills', () => {
    const { ctx, provider } = mockCtx()
    registerShuorenhuaSkills(ctx as any)
    const p = (provider as any)()
    expect(p).not.toBeNull()
    expect(p!.name).toBe('shuorenhua-skills')
  })

  it('returns a noop disposer when the skills service is unavailable', () => {
    const { ctx } = mockCtx(false)
    const dispose = registerShuorenhuaSkills(ctx as any)
    expect(typeof dispose).toBe('function')
    expect(() => dispose()).not.toThrow()
  })

  it('lists the packaged shuorenhua candidate with bundled metadata', async () => {
    const { ctx, provider } = mockCtx()
    registerShuorenhuaSkills(ctx as any)
    const p = (provider as any)() as SkillProvider
    const candidates = await p.list({}) as readonly SkillCandidate[]
    const skill = candidates.find(c => c.name === 'shuorenhua')
    expect(skill).toBeDefined()
    expect(skill!.description).toBeTruthy()
    expect(skill!.rank).toBe(400)
    expect(skill!.source).toBe('bundled')
    expect(skill!.provider).toBe('shuorenhua-skills')
    expect(skill!.invocation.modelInvocable).toBe(true)
    expect(skill!.invocation.userInvocable).toBe(true)
    expect(skill!.resourceBase).toEqual({ kind: 'directory', path: expect.any(String) })
  })

  it('loads the full skill body with content and resource base', async () => {
    const { ctx, provider } = mockCtx()
    registerShuorenhuaSkills(ctx as any)
    const p = (provider as any)() as SkillProvider
    const candidates = await p.list({}) as readonly SkillCandidate[]
    const skill = candidates.find(c => c.name === 'shuorenhua')!
    const def = await p.get(skill, {}) as SkillDefinition | undefined
    expect(def).toBeDefined()
    expect(def!.name).toBe('shuorenhua')
    expect(def!.content).toContain('说人话')
    expect(def!.content).toContain('保留原文的事实')
    // frontmatter is stripped (markdown tables may legitimately contain ---)
    expect(def!.content).not.toContain('name: shuorenhua')
    expect(def!.content).not.toMatch(/^---/)
    expect(def!.resourceBase).toEqual({ kind: 'directory', path: expect.any(String) })
  })

  it('returns undefined for an unknown skill name', async () => {
    const { ctx, provider } = mockCtx()
    registerShuorenhuaSkills(ctx as any)
    const p = (provider as any)() as SkillProvider
    const def = await p.get({ name: 'no-such-skill' } as SkillCandidate, {})
    expect(def).toBeUndefined()
  })
})
