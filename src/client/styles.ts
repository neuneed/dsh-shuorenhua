/**
 * Apple-inspired modern styles for dsh-shuorenhua.
 * Adapts smoothly to both light and dark backgrounds using CSS variables and clean fallbacks.
 */

export const MODAL_STYLES = `
.srh-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: srhFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 16px;
  box-sizing: border-box;
}

@keyframes srhFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes srhSlideUp {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.srh-dialog {
  background: var(--dsh-color-bg-canvas, #ffffff);
  color: var(--dsh-color-text-primary, #1e293b);
  width: 100%;
  max-width: 680px;
  max-height: 88vh;
  border-radius: 18px;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: srhSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
  border: 1px solid var(--dsh-color-border, rgba(0, 0, 0, 0.08));
}

@media (prefers-color-scheme: dark) {
  .srh-dialog {
    background: #18181b;
    color: #f4f4f5;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
}

.srh-header {
  padding: 18px 22px 14px 22px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--dsh-color-border, rgba(0, 0, 0, 0.06));
}

.srh-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.srh-icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  font-size: 16px;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.srh-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.srh-desc {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--dsh-color-text-secondary, #64748b);
  line-height: 1.4;
}

.srh-close-btn {
  background: transparent;
  border: none;
  color: var(--dsh-color-text-secondary, #94a3b8);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.srh-close-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--dsh-color-text-primary, #0f172a);
}

.srh-controls-row {
  padding: 12px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--dsh-color-border, rgba(0, 0, 0, 0.06));
  flex-wrap: wrap;
  gap: 10px;
}

.srh-mode-tabs {
  display: inline-flex;
  background: rgba(0, 0, 0, 0.05);
  padding: 3px;
  border-radius: 10px;
  gap: 2px;
}

.srh-mode-tab {
  border: none;
  background: transparent;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--dsh-color-text-secondary, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
}

.srh-mode-tab:hover {
  color: var(--dsh-color-text-primary, #0f172a);
}

.srh-mode-tab-active {
  background: var(--dsh-color-bg-canvas, #ffffff);
  color: var(--dsh-color-text-primary, #0f172a);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-weight: 600;
}

.srh-stats-pills {
  display: flex;
  align-items: center;
  gap: 8px;
}

.srh-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.04);
  color: var(--dsh-color-text-secondary, #64748b);
}

.srh-pill-badge {
  background: #10b981;
  color: white;
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
}

.srh-content {
  padding: 18px 22px;
  overflow-y: auto;
  flex: 1;
  max-height: 52vh;
}

.srh-text-box {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--dsh-color-border, rgba(0, 0, 0, 0.08));
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
  user-select: text;
}

.srh-diff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.srh-diff-pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.srh-diff-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--dsh-color-text-secondary, #64748b);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.srh-diff-box {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--dsh-color-border, rgba(0, 0, 0, 0.08));
  border-radius: 10px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 42vh;
  overflow-y: auto;
}

.srh-footer {
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--dsh-color-border, rgba(0, 0, 0, 0.06));
  background: rgba(0, 0, 0, 0.015);
}

.srh-esc-tip {
  font-size: 12px;
  color: var(--dsh-color-text-secondary, #94a3b8);
  display: flex;
  align-items: center;
  gap: 6px;
}

.srh-esc-kbd {
  display: inline-block;
  padding: 2px 5px;
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.srh-btn-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.srh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.srh-btn-secondary {
  background: rgba(0, 0, 0, 0.06);
  color: var(--dsh-color-text-primary, #1e293b);
}

.srh-btn-secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

.srh-btn-primary {
  background: #2563eb;
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.srh-btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.srh-btn-copied {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* Action button inside assistant actions strip */
.srh-action-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  height: 24px;
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  background: rgba(59, 130, 246, 0.06);
  color: #2563eb;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  margin-left: 2px;
  margin-right: 2px;
}

.srh-action-trigger:hover {
  background: rgba(59, 130, 246, 0.14);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-0.5px);
}

.srh-action-trigger:active {
  transform: translateY(0.5px);
}

@media (prefers-color-scheme: dark) {
  .srh-action-trigger {
    background: rgba(96, 165, 250, 0.12);
    border-color: rgba(96, 165, 250, 0.25);
    color: #93c5fd;
  }
  .srh-action-trigger:hover {
    background: rgba(96, 165, 250, 0.22);
    border-color: rgba(96, 165, 250, 0.45);
  }
}
`

/**
 * Ensure stylesheet is injected into the DOM once.
 */
let stylesInjected = false
export function ensureStylesInjected(): void {
  if (typeof document === 'undefined' || stylesInjected) return
  const styleEl = document.createElement('style')
  styleEl.setAttribute('data-dsh-plugin', 'dsh-shuorenhua')
  styleEl.textContent = MODAL_STYLES
  document.head.appendChild(styleEl)
  stylesInjected = true
}
