/**
 * Shuorenhua action button mounted into `conversation.chat.assistant-actions`.
 * Appears beside the built-in copy/branch actions on each completed assistant message.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ensureStylesInjected } from '../styles.js'
import { ShuorenhuaModal } from './ShuorenhuaModal.jsx'

export interface ShuorenhuaButtonProps {
  messageId?: string
  useChat?: (selector: (snapshot: any) => any) => any
  t?: (key: string) => string
}

// Original assistant text pinned per messageId.
//
// Why: `resolveTargetText()` derives the "原文" from the chat snapshot or a DOM
// fallback at click time. Once a turn closes or the message is regenerated, that
// derivation can shift and land on a sibling node (e.g. the user prompt of the
// same turn), which is exactly the "原文变成第二次发过去的 prompt" symptom.
// Locking the first good capture per messageId keeps the 原文 stable across
// reopen/regenerate, and keeps the rewrite cache keyed on the same text.
const pinnedOriginals = new Map<string, string>()
const PINNED_CAP = 200

/** First non-empty capture for a messageId wins; later opens reuse it verbatim. */
function pinOriginal(messageId: string | undefined, text: string): string {
  if (!messageId) return text
  const existing = pinnedOriginals.get(messageId)
  if (existing !== undefined) return existing
  if (!text || !text.trim()) return text // never pin a failed capture
  pinnedOriginals.set(messageId, text)
  if (pinnedOriginals.size > PINNED_CAP) {
    const oldestKey = pinnedOriginals.keys().next().value as string | undefined
    if (oldestKey !== undefined) pinnedOriginals.delete(oldestKey)
  }
  return text
}

export function ShuorenhuaButton({
  messageId,
  useChat,
  t = (k: string) => k,
}: ShuorenhuaButtonProps): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false)
  const [targetText, setTargetText] = useState('')
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    ensureStylesInjected()
  }, [])

  // 1. Try to extract message text reactively from useChat snapshot when available
  const snapshotText = typeof useChat === 'function'
    ? useChat((snapshot: any) => {
        if (!snapshot) return ''
        try {
          if (snapshot.nodes && typeof snapshot.nodes.values === 'function') {
            const nodes = snapshot.nodes.values()
            for (const node of nodes) {
              // Check assistant-step
              if (node.kind === 'assistant-step') {
                const data = node.data
                if (data?.finalNode?.messageId === messageId && Array.isArray(data?.blocks)) {
                  return data.blocks
                    .flatMap((b: any) => (b.kind === 'text' ? [b.text] : []))
                    .join('')
                }
              }
              // Check turn-tail closing — scope to THIS message's own blocks.
              // `closing.blocks` is the whole turn (user prompt + reply), so never
              // treat it as the "原文"; look for the blocks of the matching message.
              if (node.kind === 'turn-tail') {
                const closing = node.data?.closing
                if (closing?.finalNode?.messageId === messageId) {
                  const targetBlocks =
                    (Array.isArray(closing.finalNode.blocks) && closing.finalNode.blocks) ||
                    (Array.isArray(closing.steps) &&
                      closing.steps
                        .map((s: any) => s?.data)
                        .find((d: any) => d?.finalNode?.messageId === messageId)?.blocks) ||
                    (Array.isArray(closing.message?.blocks) && closing.message.blocks)
                  if (targetBlocks) {
                    const text = targetBlocks
                      .flatMap((b: any) => (b.kind === 'text' ? [b.text] : []))
                      .join('')
                    if (text.trim()) return text
                  }
                }
              }
            }
          }
          // Check legacy conversation slice
          if (Array.isArray(snapshot.legacy?.nodes)) {
            for (const n of snapshot.legacy.nodes) {
              if (n.messageId === messageId && Array.isArray(n.blocks)) {
                return n.blocks.flatMap((b: any) => (b.kind === 'text' ? [b.text] : [])).join('')
              }
            }
          }
        } catch {
          // ignore extraction error
        }
        return ''
      })
    : ''

  // 2. Resolve final text: snapshotText, or DOM inspection fallback
  const resolveTargetText = useCallback((): string => {
    if (snapshotText && snapshotText.trim().length > 0) {
      return snapshotText
    }
    // Fallback: locate THIS message's text bubble in the DOM. Never climb to the
    // turn wrapper ([data-turn-tail]) — its sibling is the previous turn and its
    // text also contains the user prompt. Walk up from the action row and take
    // the nearest non-button sibling as the message bubble.
    if (buttonRef.current && typeof document !== 'undefined') {
      try {
        let cursor: HTMLElement | null = buttonRef.current.parentElement
        for (let depth = 0; cursor && depth < 4; depth++) {
          const sibling = cursor.previousElementSibling as HTMLElement | null
          if (sibling && !sibling.querySelector('button')) {
            const text = sibling.textContent?.trim()
            if (text && text.length > 2) {
              return text
            }
          }
          cursor = cursor.parentElement
        }
      } catch {
        // fallback failed
      }
    }
    return snapshotText || ''
  }, [snapshotText])

  // Click handler: resolve text immediately (pinning it per messageId) and open popup
  const handleClick = useCallback(() => {
    const text = messageId ? pinOriginal(messageId, resolveTargetText()) : resolveTargetText()
    setTargetText(text)
    setModalOpen(true)
  }, [resolveTargetText, messageId])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="srh-action-trigger"
        onClick={handleClick}
        title={t('action.tooltip')}
        aria-label={t('action.tooltip')}
      >
        <span>💬</span>
        <span>{t('action.button')}</span>
      </button>

      {modalOpen && (
        <ShuorenhuaModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          originalText={targetText}
          messageId={messageId}
          t={t}
        />
      )}
    </>
  )
}
