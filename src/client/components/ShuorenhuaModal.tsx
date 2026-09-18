/**
 * Pop-up Modal dialog for Shuorenhua (说人话).
 * Displays real-time AI humanization with streaming typewriter output,
 * single unified mode, comparison stats, one-click copy, and ESC dismissal.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { humanize } from '../../engine/humanizer.ts'
import { ensureStylesInjected } from '../styles.ts'

export interface ShuorenhuaModalProps {
  open: boolean
  onClose: () => void
  originalText: string
  t?: (key: string) => string
}

export function ShuorenhuaModal({
  open,
  onClose,
  originalText,
  t = (k: string) => k,
}: ShuorenhuaModalProps): React.ReactPortal | null {
  const [streamedText, setStreamedText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAiGenerated, setIsAiGenerated] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showDiff, setShowDiff] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Ensure CSS styles are injected into DOM
  useEffect(() => {
    ensureStylesInjected()
  }, [])

  // Listen for Escape keydown to dismiss
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  // Trigger AI streaming transformation
  const startHumanize = useCallback(async (text: string) => {
    if (!text || !text.trim()) {
      setStreamedText('')
      setIsGenerating(false)
      return
    }

    // Abort any pending generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsGenerating(true)
    setStreamedText('')
    setIsAiGenerated(true)

    try {
      const response = await fetch('/api/shuorenhua/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error('Streaming endpoint not available')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const jsonStr = trimmed.slice(5).trim()
          if (!jsonStr) continue

          try {
            const data = JSON.parse(jsonStr)
            if (data.done) {
              // Generation completed
              break
            }
            if (data.fallback) {
              setIsAiGenerated(false)
            }
            if (typeof data.delta === 'string') {
              fullText += data.delta
              setStreamedText(fullText)
            }
          } catch {
            // Ignore malformed chunks
          }
        }
      }

      if (!fullText.trim()) {
        // Fallback if empty stream
        const fallback = humanize(text)
        setStreamedText(fallback.text)
        setIsAiGenerated(false)
      }
    } catch (err: any) {
      if (controller.signal.aborted) return
      // Network error or offline fallback
      const fallback = humanize(text)
      setStreamedText(fallback.text)
      setIsAiGenerated(false)
    } finally {
      if (!controller.signal.aborted) {
        setIsGenerating(false)
      }
    }
  }, [])

  // Start generation on open
  useEffect(() => {
    if (open && originalText) {
      startHumanize(originalText)
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [open, originalText, startHumanize])

  // Copy to clipboard handler
  const handleCopy = useCallback(async () => {
    if (!streamedText) return
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(streamedText)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = streamedText
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore clipboard errors
    }
  }, [streamedText])

  // Stats calculation
  const originalLength = originalText?.length || 0
  const humanizedLength = streamedText?.length || 0
  const savedPercentage = originalLength > 0 && humanizedLength > 0 && originalLength > humanizedLength
    ? Math.round(((originalLength - humanizedLength) / originalLength) * 100)
    : 0

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="srh-mask"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        className="srh-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t('modal.title')}
      >
        {/* Header */}
        <div className="srh-header">
          <div className="srh-title-row">
            <div className="srh-icon-badge">💬</div>
            <div>
              <h3 className="srh-title">{t('modal.title')}</h3>
              <p className="srh-desc">{t('modal.desc')}</p>
            </div>
          </div>
          <button
            type="button"
            className="srh-close-btn"
            onClick={onClose}
            aria-label={t('close.button')}
            title={t('close.button')}
          >
            ✕
          </button>
        </div>

        {/* Controls & Generation Status */}
        <div className="srh-controls-row">
          <div className="srh-status-badge">
            {isGenerating ? (
              <>
                <span className="srh-generating-dot" />
                <span>{t('status.generating')}</span>
              </>
            ) : (
              <>
                <span>{isAiGenerated ? '✨' : '⚙️'}</span>
                <span>{isAiGenerated ? t('status.completed') : t('status.offline')}</span>
              </>
            )}
          </div>

          {/* Stats pills */}
          <div className="srh-stats-pills">
            <span className="srh-pill">
              {t('stats.original')}: <b>{originalLength}</b>
            </span>
            <span className="srh-pill">
              {t('stats.humanized')}: <b>{humanizedLength}</b>
            </span>
            {savedPercentage > 0 && (
              <span className="srh-pill-badge">
                -{savedPercentage}%
              </span>
            )}
            {isAiGenerated && !isGenerating && (
              <span className="srh-pill-ai">
                AI Powered
              </span>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className="srh-content">
          {showDiff ? (
            <div className="srh-diff-grid">
              <div className="srh-diff-pane">
                <span className="srh-diff-label">{t('stats.original')}</span>
                <div className="srh-diff-box">{originalText || t('empty.tip')}</div>
              </div>
              <div className="srh-diff-pane">
                <span className="srh-diff-label">
                  {t('stats.humanized')}
                  {savedPercentage > 0 && (
                    <span className="srh-pill-badge">-{savedPercentage}%</span>
                  )}
                </span>
                <div className="srh-diff-box">
                  {streamedText || (isGenerating ? t('status.generating') : t('empty.tip'))}
                  {isGenerating && <span className="srh-stream-cursor" />}
                </div>
              </div>
            </div>
          ) : (
            <div className="srh-text-box">
              {streamedText || (isGenerating ? t('status.generating') : t('empty.tip'))}
              {isGenerating && <span className="srh-stream-cursor" />}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="srh-footer">
          <div className="srh-esc-tip">
            按 <kbd className="srh-esc-kbd">ESC</kbd> 退出
          </div>
          <div className="srh-btn-row">
            <button
              type="button"
              className="srh-btn srh-btn-secondary"
              onClick={() => startHumanize(originalText)}
              disabled={isGenerating}
              title={t('btn.regenerate')}
            >
              🔄 {t('btn.regenerate')}
            </button>
            <button
              type="button"
              className="srh-btn srh-btn-secondary"
              onClick={() => setShowDiff(!showDiff)}
            >
              {showDiff ? t('tab.result') : t('tab.diff')}
            </button>
            <button
              type="button"
              className={`srh-btn ${copied ? 'srh-btn-copied' : 'srh-btn-primary'}`}
              onClick={handleCopy}
              disabled={!streamedText || isGenerating}
            >
              {copied ? t('copy.copied') : `📋 ${t('copy.button')}`}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
