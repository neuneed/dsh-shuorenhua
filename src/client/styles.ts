/**
 * Apple-inspired modern styles for dsh-shuorenhua.
 * Adapts dynamically to DSH Web's light and dark themes using DSH native CSS variables
 * and explicit body[data-ds-dark-theme] selector selectors.
 */

export const MODAL_STYLES = `
/* --------------------------------------------------------------------------
 * Base Overlay / Mask
 * -------------------------------------------------------------------------- */
.srh-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--dsw-alias-bg-mask-3, rgba(15, 23, 42, 0.55));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
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
    transform: scale(0.96) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes srhPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.96); }
}

@keyframes srhShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* --------------------------------------------------------------------------
 * Dialog Container (Light theme default)
 * -------------------------------------------------------------------------- */
.srh-dialog {
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #0f172a);
  width: 100%;
  max-width: 680px;
  max-height: 88vh;
  border-radius: 18px;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: srhSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

/* --------------------------------------------------------------------------
 * Dark Theme: Selected by DSH Web's body[data-ds-dark-theme] attribute
 * -------------------------------------------------------------------------- */
body[data-ds-dark-theme] .srh-dialog {
  background: var(--dsw-alias-bg-layer-1, #18181b);
  color: var(--dsw-alias-label-primary, #f4f4f5);
  border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.12));
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06);
}

/* --------------------------------------------------------------------------
 * Dialog Header
 * -------------------------------------------------------------------------- */
.srh-header {
  padding: 18px 22px 14px 22px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.06));
}

body[data-ds-dark-theme] .srh-header {
  border-bottom-color: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.08));
}

.srh-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.srh-icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  font-size: 17px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.srh-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--dsw-alias-label-primary, #0f172a);
}

body[data-ds-dark-theme] .srh-title {
  color: var(--dsw-alias-label-primary, #f4f4f5);
}

.srh-desc {
  margin: 3px 0 0 0;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #64748b);
  line-height: 1.4;
}

body[data-ds-dark-theme] .srh-desc {
  color: var(--dsw-alias-label-secondary, #94a3b8);
}

.srh-close-btn {
  background: transparent;
  border: none;
  color: var(--dsw-alias-label-secondary, #94a3b8);
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
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06));
  color: var(--dsw-alias-label-primary, #0f172a);
}

body[data-ds-dark-theme] .srh-close-btn:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(255, 255, 255, 0.1));
  color: #ffffff;
}

/* --------------------------------------------------------------------------
 * Controls & Status Row
 * -------------------------------------------------------------------------- */
.srh-controls-row {
  padding: 10px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.06));
  flex-wrap: wrap;
  gap: 10px;
}

body[data-ds-dark-theme] .srh-controls-row {
  background: rgba(255, 255, 255, 0.02);
  border-bottom-color: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.08));
}

.srh-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #64748b);
}

body[data-ds-dark-theme] .srh-status-badge {
  color: var(--dsw-alias-label-secondary, #94a3b8);
}

.srh-generating-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 8px #3b82f6;
  animation: srhPulse 1.2s infinite ease-in-out;
}

.srh-stats-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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
  color: var(--dsw-alias-label-secondary, #64748b);
}

body[data-ds-dark-theme] .srh-pill {
  background: rgba(255, 255, 255, 0.06);
  color: var(--dsw-alias-label-secondary, #94a3b8);
}

.srh-pill-badge {
  background: #10b981;
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
}

.srh-pill-ai {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
}

/* --------------------------------------------------------------------------
 * Content Area & Text Box
 * -------------------------------------------------------------------------- */
.srh-content {
  padding: 18px 22px;
  overflow-y: auto;
  flex: 1;
  max-height: 54vh;
}

.srh-text-box {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  user-select: text;
  color: var(--dsw-alias-label-primary, #0f172a);
  min-height: 100px;
}

body[data-ds-dark-theme] .srh-text-box {
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.1));
  color: var(--dsw-alias-label-primary, #f4f4f5);
}

/* Streaming typewriter cursor */
.srh-stream-cursor {
  display: inline-block;
  width: 7px;
  height: 15px;
  background-color: #3b82f6;
  margin-left: 3px;
  vertical-align: middle;
  animation: srhPulse 0.8s infinite;
  border-radius: 2px;
}

/* Diff View */
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
  color: var(--dsw-alias-label-secondary, #64748b);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

body[data-ds-dark-theme] .srh-diff-label {
  color: var(--dsw-alias-label-secondary, #94a3b8);
}

.srh-diff-box {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));
  border-radius: 10px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 44vh;
  overflow-y: auto;
  color: var(--dsw-alias-label-primary, #0f172a);
}

body[data-ds-dark-theme] .srh-diff-box {
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.1));
  color: var(--dsw-alias-label-primary, #f4f4f5);
}

/* --------------------------------------------------------------------------
 * Footer & Buttons
 * -------------------------------------------------------------------------- */
.srh-footer {
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.06));
  background: rgba(0, 0, 0, 0.015);
}

body[data-ds-dark-theme] .srh-footer {
  border-top-color: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.08));
  background: rgba(255, 255, 255, 0.02);
}

.srh-esc-tip {
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #94a3b8);
  display: flex;
  align-items: center;
  gap: 6px;
}

body[data-ds-dark-theme] .srh-esc-tip {
  color: var(--dsw-alias-label-secondary, #6b7280);
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
  color: var(--dsw-alias-label-secondary, #64748b);
}

body[data-ds-dark-theme] .srh-esc-kbd {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--dsw-alias-label-secondary, #9ca3af);
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
  color: var(--dsw-alias-label-primary, #1e293b);
}

.srh-btn-secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

body[data-ds-dark-theme] .srh-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--dsw-alias-label-primary, #f3f4f6);
}

body[data-ds-dark-theme] .srh-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.14);
}

.srh-btn-primary {
  background: #2563eb;
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.srh-btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.srh-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.srh-btn-copied {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* --------------------------------------------------------------------------
 * Action Button in Assistant Actions Strip
 * -------------------------------------------------------------------------- */
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

body[data-ds-dark-theme] .srh-action-trigger {
  background: rgba(96, 165, 250, 0.12);
  border-color: rgba(96, 165, 250, 0.25);
  color: #93c5fd;
}

body[data-ds-dark-theme] .srh-action-trigger:hover {
  background: rgba(96, 165, 250, 0.22);
  border-color: rgba(96, 165, 250, 0.45);
}

/* Fallback for system dark mode when data-ds-dark-theme attribute is absent */
@media (prefers-color-scheme: dark) {
  body:not([data-ds-dark-theme="false"]) .srh-dialog {
    background: var(--dsw-alias-bg-layer-1, #18181b);
    color: var(--dsw-alias-label-primary, #f4f4f5);
    border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.12));
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
