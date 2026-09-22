/**
 * Packaged skill provider for dsh-shuorenhua.
 *
 * Registers a skill provider on `ctx.skills` that scans the packaged `skills/`
 * directory (import.meta.url-relative, so it resolves wherever the package is
 * installed — the profile composition's baseUrl points at the profile directory,
 * not at this package, which is why the skills ride behind plugin code instead
 * of a `skill-filesystem` `customSkillDirs` row).
 *
 * Rank 400 (user-dsh tier): shadows `~/.agents/skills` (rank 500), yields to
 * project roots (rank 100/200). The provider scans `skills/` on every `list()`
 * call; the registry caches snapshots, keeping live edits cheap. Frontmatter
 * here is the flat subset `dsh-skill-filesystem` accepts (`name`, `description`,
 * `whenToUse`, `disable-model-invocation`, `user-invocable`).
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import type {
  SkillCandidate,
  SkillDefinition,
  SkillInvocationPolicy,
  SkillProvider,
  SkillProviderControl,
  SkillSource,
} from '@deepseek-ai/dsh-skill'

const PROVIDER_NAME = 'shuorenhua-skills'
/** Packaged skills directory, resolved relative to this module file. */
const SKILLS_PATH = fileURLToPath(new URL('../skills/', import.meta.url))
/** Matches user-dsh roots: shadows ~/.agents/skills (rank 500), yields to project roots. */
const RANK = 400
const SOURCE: SkillSource = 'bundled'

/** Flat frontmatter fields the packaged SKILL.md files use. */
interface PackedSkill {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string
  readonly invocation: SkillInvocationPolicy
  readonly directory: string
  readonly skillPath: string
  readonly body: string
}

/** Render an arbitrary thrown value without trusting coercion. */
function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  try {
    return String(error)
  } catch {
    return '[unrenderable thrown value]'
  }
}

/**
 * Parse a flat `key: value` YAML frontmatter block — the subset
 * `dsh-skill-filesystem` accepts. Nested YAML is not supported; packaged
 * SKILL.md files keep frontmatter flat by convention.
 * @param raw - the SKILL.md text.
 * @returns parsed fields and body, or `undefined` when no frontmatter block is present.
 */
function parseFrontmatter(raw: string): { fields: Record<string, string>; body: string } | undefined {
  const lines = raw.split(/\r?\n/)
  if (lines[0] !== '---') return undefined
  const fields: Record<string, string> = {}
  let i = 1
  for (; i < lines.length && lines[i] !== '---'; i++) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i])
    if (match === null) throw new Error(`unparseable frontmatter line: "${lines[i]}"`)
    fields[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  if (i >= lines.length) throw new Error('frontmatter not closed')
  return { fields, body: lines.slice(i + 1).join('\n').trim() }
}

/** Resolve the invocation policy from flat frontmatter fields. */
function parseInvocation(fields: Record<string, string>): SkillInvocationPolicy {
  return {
    modelInvocable: fields['disable-model-invocation'] !== 'true',
    userInvocable: fields['user-invocable'] !== 'false',
  }
}

/**
 * Read one skill directory into a parsed packed skill.
 * @param directory - absolute skill directory (parent of SKILL.md).
 * @param dirName - directory name, must match the frontmatter `name`.
 * @returns the parsed skill.
 */
async function loadSkill(directory: string, dirName: string): Promise<PackedSkill> {
  const skillPath = join(directory, 'SKILL.md')
  const raw = await readFile(skillPath, 'utf8')
  const parsed = parseFrontmatter(raw)
  if (parsed === undefined) throw new Error(`${skillPath} has no frontmatter`)
  const { fields, body } = parsed
  if (fields.name !== dirName) {
    throw new Error(`${skillPath} name "${fields.name}" != directory "${dirName}"`)
  }
  if (!fields.description) throw new Error(`${skillPath} missing description`)
  return {
    name: fields.name,
    description: fields.description,
    ...fields.whenToUse ? { whenToUse: fields.whenToUse } : {},
    invocation: parseInvocation(fields),
    directory,
    skillPath,
    body,
  }
}

/**
 * Scan the packaged `skills/` directory; malformed skills are logged and skipped.
 * @param ctx - Cordis Context for logger access.
 * @returns parsed packed skills, sorted by name.
 */
async function scanSkills(ctx: Context): Promise<PackedSkill[]> {
  const entries = await readdir(SKILLS_PATH, { withFileTypes: true })
  const skills: PackedSkill[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    try {
      skills.push(await loadSkill(join(SKILLS_PATH, entry.name), entry.name))
    } catch (error) {
      ctx.logger.warn(`skill "${entry.name}" ignored: ${errorMessage(error)}`)
    }
  }
  return skills
}

/**
 * Create the packaged skill provider bound to a logger for malformed-skill warnings.
 * @param ctx - Cordis Context (for logger access during scans).
 * @returns the skill provider serving the packaged `skills/` directory.
 */
function createProvider(ctx: Context): SkillProvider {
  return {
    name: PROVIDER_NAME,
    async list(): Promise<readonly SkillCandidate[]> {
      return (await scanSkills(ctx)).map(skill => ({
        name: skill.name,
        description: skill.description,
        ...skill.whenToUse !== undefined ? { whenToUse: skill.whenToUse } : {},
        invocation: skill.invocation,
        provider: PROVIDER_NAME,
        source: SOURCE,
        resourceBase: { kind: 'directory', path: skill.directory },
        rank: RANK,
        locator: skill.skillPath,
      }))
    },
    async get(candidate): Promise<SkillDefinition | undefined> {
      const skills = await scanSkills(ctx)
      const skill = skills.find(entry => entry.name === candidate.name)
      if (skill === undefined) return undefined
      return {
        name: skill.name,
        description: skill.description,
        ...skill.whenToUse !== undefined ? { whenToUse: skill.whenToUse } : {},
        invocation: skill.invocation,
        provider: PROVIDER_NAME,
        source: SOURCE,
        resourceBase: { kind: 'directory', path: skill.directory },
        content: skill.body,
        path: skill.skillPath,
      }
    },
  }
}

/**
 * Register the packaged shuorenhua skill provider on `ctx.skills`.
 * @param ctx - Cordis Context with `skills` available.
 * @returns disposer (effect; auto-cleaned on unload), or a noop when the
 *   skills service is unavailable.
 */
export function registerShuorenhuaSkills(ctx: Context): () => void {
  const skills = ctx.get('skills')
  if (!skills || typeof skills.registerProvider !== 'function') {
    return () => {}
  }
  return skills.registerProvider((_control: SkillProviderControl) => createProvider(ctx))
}
