import { describe, expect, it } from 'vitest'
import {
  humanizeCacheKey,
  isFreshCacheRecord,
  type HumanizeCacheRecord,
} from '../src/cache.js'

describe('humanizeCacheKey', () => {
  it('is stable for the same messageId and source text', () => {
    expect(humanizeCacheKey('msg-1', 'hello')).toBe(humanizeCacheKey('msg-1', 'hello'))
  })

  it('distinguishes messages by id', () => {
    expect(humanizeCacheKey('msg-1', 'hello')).not.toBe(humanizeCacheKey('msg-2', 'hello'))
  })

  it('falls back to a stable text hash when no id is available', () => {
    expect(humanizeCacheKey(undefined, 'same text')).toBe(humanizeCacheKey(undefined, 'same text'))
    expect(humanizeCacheKey(undefined, 'source a')).toMatch(/^anon:/)
    expect(humanizeCacheKey(undefined, 'source a')).not.toBe(humanizeCacheKey(undefined, 'source b'))
  })
})

describe('isFreshCacheRecord', () => {
  it('accepts a record derived from the exact same source text', () => {
    const record: HumanizeCacheRecord = { original: 'source', text: 'rewritten', ts: 1 }
    expect(isFreshCacheRecord(record, 'source')).toBe(true)
  })

  it('rejects a record whose source differs (regenerated content under the same id)', () => {
    const record: HumanizeCacheRecord = { original: 'old source', text: 'rewritten', ts: 1 }
    expect(isFreshCacheRecord(record, 'new source')).toBe(false)
  })

  it('rejects absent or empty records', () => {
    expect(isFreshCacheRecord(undefined, 'source')).toBe(false)
    expect(isFreshCacheRecord({ original: 'source', text: '', ts: 1 }, 'source')).toBe(false)
  })
})