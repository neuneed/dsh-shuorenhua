/**
 * Pop-up Modal dialog for Shuorenhua (说人话).
 * Displays real-time AI humanization with streaming typewriter output,
 * single unified mode, comparison stats, one-click copy, and ESC dismissal.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [error, setError] = useState<string | null>(null)
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
      setError(t('empty.tip'))
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
    setError(null)

    try {
      let streamAttempted = false
      try {
        const response = await fetch('/shuorenhua/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        })

        if (response.ok && response.body) {
          streamAttempted = true
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

              let data: any
              try {
                data = JSON.parse(jsonStr)
              } catch {
                continue
              }

              if (data.error) {
                throw new Error(data.error)
              }
              if (data.done) {
                break
              }
              if (typeof data.delta === 'string') {
                fullText += data.delta
                setStreamedText(fullText)
              }
            }
          }

          if (!fullText.trim()) {
            throw new Error('AI 返回内容为空，请检查模型提供方与网络配置后重试')
          }
          return
        }
      } catch (streamErr: any) {
        if (controller.signal.aborted) return
        if (streamAttempted) throw streamErr
        // If streaming route was not available, proceed to Typert RPC fallback
      }

      // Typert RPC fallback: call /api/shuorenhua/humanize directly over DSH Connection
      const rpcResponse = await fetch('/api/shuorenhua/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'client-request',
          rpcId: String(Date.now()),
          method: 'shuorenhua/humanize',
          payload: { args: { text } },
        }),
        signal: controller.signal,
      })

      if (!rpcResponse.ok) {
        throw new Error(`RPC 失败 HTTP ${rpcResponse.status}: 宿主服务未就绪`)
      }

      const rpcData = await rpcResponse.json()
      if (rpcData.result?.ok && rpcData.result.value?.text) {
        setStreamedText(rpcData.result.value.text)
        return
      }
      if (rpcData.result?.error?.message) {
        throw new Error(rpcData.result.error.message)
      }
      throw new Error('AI 润色未返回有效结果')
    } catch (err: any) {
      if (controller.signal.aborted) return
      setError(err?.message || 'AI 润色请求失败，请检查服务后点击重试')
    } finally {
      if (!controller.signal.aborted) {
        setIsGenerating(false)
      }
    }
  }, [t])

  // Automatically start humanizing whenever the modal opens
  useEffect(() => {
    if (open) {
      setStreamedText('')
      setError(null)
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
            ) : error ? (
              <span style={{ color: '#ef4444' }}>
                ⚠️ {error}
              </span>
            ) : (
              <>
                <span>✨</span>
                <span>{t('status.completed')}</span>
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
            {!isGenerating && !error && streamedText && (
              <span className="srh-pill-ai">
                AI Powered
              </span>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className="srh-content">
          {error ? (
            <div className="srh-text-box" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: 600, color: '#ef4444' }}>
                润色失败
              </p>
              <p style={{ margin: '0 0 16px 0', fontSize: 13, opacity: 0.85 }}>
                {error}
              </p>
              <button
                type="button"
                className="srh-btn srh-btn-primary"
                onClick={() => startHumanize(originalText)}
              >
                🔄 重新润色
              </button>
            </div>
          ) : showDiff ? (
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
