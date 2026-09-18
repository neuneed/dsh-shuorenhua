/**
 * Pop-up Modal dialog for Shuorenhua (说人话).
 * Displays humanized text, comparison stats, mode switcher, one-click copy, and ESC dismissal.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { humanize } from '../../engine/humanizer.ts'
import type { HumanizeMode } from '../../types.ts'
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
  const [mode, setMode] = useState<HumanizeMode>('natural')
  const [copied, setCopied] = useState(false)
  const [showDiff, setShowDiff] = useState(false)

  // Ensure CSS styles are present
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

  // Compute humanized result whenever mode or text changes
  const result = useMemo(() => {
    return humanize(originalText, { mode })
  }, [originalText, mode])

  // Copy to clipboard handler
  const handleCopy = useCallback(async () => {
    if (!result.text) return
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(result.text)
      } else {
        // Fallback for older/non-secure contexts
        const textarea = document.createElement('textarea')
        textarea.value = result.text
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
  }, [result.text])

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

        {/* Controls & Stats */}
        <div className="srh-controls-row">
          {/* Mode Switcher */}
          <div className="srh-mode-tabs" role="tablist">
            <button
              type="button"
              className={`srh-mode-tab ${mode === 'natural' ? 'srh-mode-tab-active' : ''}`}
              onClick={() => setMode('natural')}
            >
              🌿 {t('mode.natural')}
            </button>
            <button
              type="button"
              className={`srh-mode-tab ${mode === 'concise' ? 'srh-mode-tab-active' : ''}`}
              onClick={() => setMode('concise')}
            >
              ⚡ {t('mode.concise')}
            </button>
            <button
              type="button"
              className={`srh-mode-tab ${mode === 'code_first' ? 'srh-mode-tab-active' : ''}`}
              onClick={() => setMode('code_first')}
            >
              💻 {t('mode.code_first')}
            </button>
          </div>

          {/* Stats pills */}
          <div className="srh-stats-pills">
            <span className="srh-pill">
              {t('stats.original')}: <b>{result.stats.originalLength}</b>
            </span>
            <span className="srh-pill">
              {t('stats.humanized')}: <b>{result.stats.humanizedLength}</b>
            </span>
            {result.stats.savedPercentage > 0 && (
              <span className="srh-pill-badge">
                -{result.stats.savedPercentage}%
              </span>
            )}
            {result.stats.replacedBuzzwords > 0 && (
              <span className="srh-pill">
                {t('stats.buzzwords')}: <b>{result.stats.replacedBuzzwords}</b>
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
                  <span className="srh-pill-badge">-{result.stats.savedPercentage}%</span>
                </span>
                <div className="srh-diff-box">{result.text || t('empty.tip')}</div>
              </div>
            </div>
          ) : (
            <div className="srh-text-box">
              {result.text || t('empty.tip')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="srh-footer">
          <div className="srh-esc-tip">
            按 <kbd className="srh-esc-kbd">ESC</kbd> 快速退出
          </div>
          <div className="srh-btn-row">
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
