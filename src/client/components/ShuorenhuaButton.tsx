/**
 * Shuorenhua action button mounted into `conversation.chat.assistant-actions`.
 * Appears beside the built-in copy/branch actions on each completed assistant message.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ensureStylesInjected } from '../styles.ts'
import { ShuorenhuaModal } from './ShuorenhuaModal.tsx'

export interface ShuorenhuaButtonProps {
  messageId?: string
  useChat?: (selector: (snapshot: any) => any) => any
  t?: (key: string) => string
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
        if (!snapshot || !snapshot.nodes || typeof snapshot.nodes.values !== 'function') {
          return ''
        }
        try {
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
            // Check turn-tail closing
            if (node.kind === 'turn-tail') {
              const data = node.data
              if (
                data?.closing?.finalNode?.messageId === messageId &&
                Array.isArray(data?.closing?.blocks)
              ) {
                return data.closing.blocks
                  .flatMap((b: any) => (b.kind === 'text' ? [b.text] : []))
                  .join('')
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
    // Fallback: look backwards in the DOM to locate the assistant response text
    if (buttonRef.current && typeof document !== 'undefined') {
      try {
        const row = buttonRef.current.closest('[data-turn-tail]') || buttonRef.current.parentElement
        if (row) {
          let prev = row.previousElementSibling
          while (prev) {
            const text = prev.textContent?.trim()
            if (text && text.length > 5) {
              return text
            }
            prev = prev.previousElementSibling
          }
        }
      } catch {
        // fallback failed
      }
    }
    return snapshotText || ''
  }, [snapshotText])

  // Click handler: resolve text immediately and open popup
  const handleClick = useCallback(() => {
    const text = resolveTargetText()
    setTargetText(text)
    setModalOpen(true)
  }, [resolveTargetText])

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
          t={t}
        />
      )}
    </>
  )
}
