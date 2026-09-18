window.__ModuleLoader__.load({ id: 'dsh-shuorenhua', factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  NS: () => NS,
  ShuorenhuaButton: () => ShuorenhuaButton,
  ShuorenhuaModal: () => ShuorenhuaModal,
  apply: () => apply,
  en: () => en,
  inject: () => inject,
  name: () => name,
  zh: () => zh
});
module.exports = __toCommonJS(index_exports);

// src/client/components/ShuorenhuaButton.tsx
var import_react2 = require("react");

// src/client/styles.ts
var MODAL_STYLES = `
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
`;
var stylesInjected = false;
function ensureStylesInjected() {
  if (typeof document === "undefined" || stylesInjected) return;
  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-dsh-plugin", "dsh-shuorenhua");
  styleEl.textContent = MODAL_STYLES;
  document.head.appendChild(styleEl);
  stylesInjected = true;
}

// src/client/components/ShuorenhuaModal.tsx
var import_react = require("react");
var import_react_dom = require("react-dom");
var import_jsx_runtime = require("react/jsx-runtime");
function ShuorenhuaModal({
  open,
  onClose,
  originalText,
  t = (k) => k
}) {
  const [streamedText, setStreamedText] = (0, import_react.useState)("");
  const [isGenerating, setIsGenerating] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const [copied, setCopied] = (0, import_react.useState)(false);
  const [showDiff, setShowDiff] = (0, import_react.useState)(false);
  const abortControllerRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    ensureStylesInjected();
  }, []);
  (0, import_react.useEffect)(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);
  const startHumanize = (0, import_react.useCallback)(async (text) => {
    if (!text || !text.trim()) {
      setStreamedText("");
      setIsGenerating(false);
      setError(t("empty.tip"));
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);
    setStreamedText("");
    setError(null);
    try {
      let streamAttempted = false;
      try {
        const response = await fetch("/shuorenhua/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text }),
          signal: controller.signal
        });
        if (response.ok && response.body) {
          streamAttempted = true;
          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";
          let fullText = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const jsonStr = trimmed.slice(5).trim();
              if (!jsonStr) continue;
              let data;
              try {
                data = JSON.parse(jsonStr);
              } catch {
                continue;
              }
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.done) {
                break;
              }
              if (typeof data.delta === "string") {
                fullText += data.delta;
                setStreamedText(fullText);
              }
            }
          }
          if (!fullText.trim()) {
            throw new Error("AI \u8FD4\u56DE\u5185\u5BB9\u4E3A\u7A7A\uFF0C\u8BF7\u68C0\u67E5\u6A21\u578B\u63D0\u4F9B\u65B9\u4E0E\u7F51\u7EDC\u914D\u7F6E\u540E\u91CD\u8BD5");
          }
          return;
        }
      } catch (streamErr) {
        if (controller.signal.aborted) return;
        if (streamAttempted) throw streamErr;
      }
      const rpcResponse = await fetch("/api/shuorenhua/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "client-request",
          rpcId: String(Date.now()),
          method: "shuorenhua/humanize",
          payload: { args: { text } }
        }),
        signal: controller.signal
      });
      if (!rpcResponse.ok) {
        throw new Error(`RPC \u5931\u8D25 HTTP ${rpcResponse.status}: \u5BBF\u4E3B\u670D\u52A1\u672A\u5C31\u7EEA`);
      }
      const rpcData = await rpcResponse.json();
      if (rpcData.result?.ok && rpcData.result.value?.text) {
        setStreamedText(rpcData.result.value.text);
        return;
      }
      if (rpcData.result?.error?.message) {
        throw new Error(rpcData.result.error.message);
      }
      throw new Error("AI \u6DA6\u8272\u672A\u8FD4\u56DE\u6709\u6548\u7ED3\u679C");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err?.message || "AI \u6DA6\u8272\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u670D\u52A1\u540E\u70B9\u51FB\u91CD\u8BD5");
    } finally {
      if (!controller.signal.aborted) {
        setIsGenerating(false);
      }
    }
  }, [t]);
  (0, import_react.useEffect)(() => {
    if (open) {
      setStreamedText("");
      setError(null);
      startHumanize(originalText);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [open, originalText, startHumanize]);
  const handleCopy = (0, import_react.useCallback)(async () => {
    if (!streamedText) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(streamedText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = streamedText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch {
    }
  }, [streamedText]);
  const originalLength = originalText?.length || 0;
  const humanizedLength = streamedText?.length || 0;
  const savedPercentage = originalLength > 0 && humanizedLength > 0 && originalLength > humanizedLength ? Math.round((originalLength - humanizedLength) / originalLength * 100) : 0;
  if (!open || typeof document === "undefined") return null;
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: "srh-mask",
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        },
        role: "presentation",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            className: "srh-dialog",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": t("modal.title"),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-header", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-title-row", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "srh-icon-badge", children: "\u{1F4AC}" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "srh-title", children: t("modal.title") }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "srh-desc", children: t("modal.desc") })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "srh-close-btn",
                    onClick: onClose,
                    "aria-label": t("close.button"),
                    title: t("close.button"),
                    children: "\u2715"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-controls-row", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "srh-status-badge", children: isGenerating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "srh-generating-dot" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("status.generating") })
                ] }) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: "#ef4444" }, children: [
                  "\u26A0\uFE0F ",
                  error
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u2728" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("status.completed") })
                ] }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-stats-pills", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-pill", children: [
                    t("stats.original"),
                    ": ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: originalLength })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-pill", children: [
                    t("stats.humanized"),
                    ": ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: humanizedLength })
                  ] }),
                  savedPercentage > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-pill-badge", children: [
                    "-",
                    savedPercentage,
                    "%"
                  ] }),
                  !isGenerating && !error && streamedText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "srh-pill-ai", children: "AI Powered" })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "srh-content", children: error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-text-box", style: { borderColor: "rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { margin: "0 0 12px 0", fontWeight: 600, color: "#ef4444" }, children: "\u6DA6\u8272\u5931\u8D25" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { margin: "0 0 16px 0", fontSize: 13, opacity: 0.85 }, children: error }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "srh-btn srh-btn-primary",
                    onClick: () => startHumanize(originalText),
                    children: "\u{1F504} \u91CD\u65B0\u6DA6\u8272"
                  }
                )
              ] }) : showDiff ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-diff-grid", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-diff-pane", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "srh-diff-label", children: t("stats.original") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "srh-diff-box", children: originalText || t("empty.tip") })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-diff-pane", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-diff-label", children: [
                    t("stats.humanized"),
                    savedPercentage > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-pill-badge", children: [
                      "-",
                      savedPercentage,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-diff-box", children: [
                    streamedText || (isGenerating ? t("status.generating") : t("empty.tip")),
                    isGenerating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "srh-stream-cursor" })
                  ] })
                ] })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-text-box", children: [
                streamedText || (isGenerating ? t("status.generating") : t("empty.tip")),
                isGenerating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "srh-stream-cursor" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-footer", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-esc-tip", children: [
                  "\u6309 ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { className: "srh-esc-kbd", children: "ESC" }),
                  " \u9000\u51FA"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-btn-row", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "button",
                    {
                      type: "button",
                      className: "srh-btn srh-btn-secondary",
                      onClick: () => startHumanize(originalText),
                      disabled: isGenerating,
                      title: t("btn.regenerate"),
                      children: [
                        "\u{1F504} ",
                        t("btn.regenerate")
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      type: "button",
                      className: "srh-btn srh-btn-secondary",
                      onClick: () => setShowDiff(!showDiff),
                      children: showDiff ? t("tab.result") : t("tab.diff")
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      type: "button",
                      className: `srh-btn ${copied ? "srh-btn-copied" : "srh-btn-primary"}`,
                      onClick: handleCopy,
                      disabled: !streamedText || isGenerating,
                      children: copied ? t("copy.copied") : `\u{1F4CB} ${t("copy.button")}`
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      }
    ),
    document.body
  );
}

// src/client/components/ShuorenhuaButton.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function ShuorenhuaButton({
  messageId,
  useChat,
  t = (k) => k
}) {
  const [modalOpen, setModalOpen] = (0, import_react2.useState)(false);
  const [targetText, setTargetText] = (0, import_react2.useState)("");
  const buttonRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    ensureStylesInjected();
  }, []);
  const snapshotText = typeof useChat === "function" ? useChat((snapshot) => {
    if (!snapshot) return "";
    try {
      if (snapshot.nodes && typeof snapshot.nodes.values === "function") {
        const nodes = snapshot.nodes.values();
        for (const node of nodes) {
          if (node.kind === "assistant-step") {
            const data = node.data;
            if (data?.finalNode?.messageId === messageId && Array.isArray(data?.blocks)) {
              return data.blocks.flatMap((b) => b.kind === "text" ? [b.text] : []).join("");
            }
          }
          if (node.kind === "turn-tail") {
            const data = node.data;
            if (data?.closing?.finalNode?.messageId === messageId && Array.isArray(data?.closing?.blocks)) {
              return data.closing.blocks.flatMap((b) => b.kind === "text" ? [b.text] : []).join("");
            }
          }
        }
      }
      if (Array.isArray(snapshot.legacy?.nodes)) {
        for (const n of snapshot.legacy.nodes) {
          if (n.messageId === messageId && Array.isArray(n.blocks)) {
            return n.blocks.flatMap((b) => b.kind === "text" ? [b.text] : []).join("");
          }
        }
      }
    } catch {
    }
    return "";
  }) : "";
  const resolveTargetText = (0, import_react2.useCallback)(() => {
    if (snapshotText && snapshotText.trim().length > 0) {
      return snapshotText;
    }
    if (buttonRef.current && typeof document !== "undefined") {
      try {
        const row = buttonRef.current.closest("[data-turn-tail]") || buttonRef.current.parentElement;
        if (row) {
          let prev = row.previousElementSibling;
          while (prev) {
            const text = prev.textContent?.trim();
            if (text && text.length > 2) {
              return text;
            }
            prev = prev.previousElementSibling;
          }
          const turnContainer = row.parentElement;
          if (turnContainer) {
            const clone = turnContainer.cloneNode(true);
            clone.querySelectorAll("button, [data-turn-tail]").forEach((el) => el.remove());
            const text = clone.textContent?.trim();
            if (text && text.length > 2) {
              return text;
            }
          }
        }
      } catch {
      }
    }
    return snapshotText || "";
  }, [snapshotText]);
  const handleClick = (0, import_react2.useCallback)(() => {
    const text = resolveTargetText();
    setTargetText(text);
    setModalOpen(true);
  }, [resolveTargetText]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "button",
      {
        ref: buttonRef,
        type: "button",
        className: "srh-action-trigger",
        onClick: handleClick,
        title: t("action.tooltip"),
        "aria-label": t("action.tooltip"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u{1F4AC}" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("action.button") })
        ]
      }
    ),
    modalOpen && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      ShuorenhuaModal,
      {
        open: modalOpen,
        onClose: () => setModalOpen(false),
        originalText: targetText,
        t
      }
    )
  ] });
}

// src/client/locales.ts
var NS = "shuorenhua";
var zh = {
  "action.button": "\u8BF4\u4EBA\u8BDD",
  "action.tooltip": "\u8BF4\u4EBA\u8BDD \xB7 AI \u6DF1\u5EA6\u53BB\u5473\u6DA6\u8272",
  "modal.title": "\u8BF4\u4EBA\u8BDD \xB7 \u53BB AI \u5473\u6DA6\u8272",
  "modal.desc": "\u6DF1\u5EA6\u878D\u5408\u4E09\u5927\u5F00\u6E90\u89C4\u5219\u4F53\u7CFB\uFF0CAI \u5B9E\u65F6\u91CD\u5199\u771F\u5B9E\u3001\u901A\u4FD7\u3001\u65E0\u5957\u8BDD\u7684\u81EA\u7136\u4EBA\u8BDD",
  "status.generating": "AI \u6B63\u5728\u6DA6\u8272\u8F6C\u5316\u4E2D...",
  "status.completed": "AI \u6DA6\u8272\u5B8C\u6210",
  "status.offline": "\u79BB\u7EBF\u89C4\u5219\u6DA6\u8272",
  "stats.original": "\u539F\u6587\u5B57\u6570",
  "stats.humanized": "\u6DA6\u8272\u5B57\u6570",
  "stats.saved": "\u7CBE\u7B80",
  "stats.openers": "\u6D88\u9664\u5F00\u573A",
  "stats.closers": "\u6D88\u9664\u7ED3\u5C3E",
  "stats.buzzwords": "\u6D88\u9664\u5957\u8BDD",
  "copy.button": "\u4E00\u952E\u590D\u5236",
  "copy.copied": "\u5DF2\u590D\u5236 \u2713",
  "close.button": "\u5173\u95ED (ESC)",
  "tab.result": "\u6DA6\u8272\u7ED3\u679C",
  "tab.diff": "\u5BF9\u6BD4\u89C6\u56FE",
  "btn.regenerate": "\u91CD\u65B0\u6DA6\u8272",
  "empty.tip": "\u6682\u672A\u83B7\u53D6\u5230\u672C\u8F6E\u56DE\u7B54\u7684\u6587\u672C\u5185\u5BB9"
};
var en = {
  "action.button": "Humanize",
  "action.tooltip": "Speak Human \xB7 De-AI & Simplify",
  "modal.title": "Speak Human \xB7 De-AI & Simplify",
  "modal.desc": "Synthesized from 3 open-source humanizer rules, rewrites AI fluff into authentic human speech.",
  "status.generating": "AI is humanizing text...",
  "status.completed": "Humanized with AI",
  "status.offline": "Local Rule Mode",
  "stats.original": "Original",
  "stats.humanized": "Polished",
  "stats.saved": "Reduced",
  "stats.openers": "Openers",
  "stats.closers": "Closers",
  "stats.buzzwords": "Buzzwords",
  "copy.button": "Copy Text",
  "copy.copied": "Copied \u2713",
  "close.button": "Close (ESC)",
  "tab.result": "Result",
  "tab.diff": "Compare",
  "btn.regenerate": "Regenerate",
  "empty.tip": "No text detected for this message round."
};

// src/client/index.tsx
var name = "dsh-shuorenhua";
var inject = ["slots", "locale"];
function apply(ctx) {
  ctx.effect(() => {
    try {
      const localeService = ctx.locale;
      if (localeService && typeof localeService.register === "function") {
        return localeService.register(NS, { zh, en });
      }
    } catch {
    }
    return () => {
    };
  }, "dsh-shuorenhua: dictionaries");
  ctx.slots.inject(
    "conversation.chat.assistant-actions",
    () => ctx.slots.register(
      {
        name: "conversation.chat.assistant-actions",
        id: "shuorenhua",
        order: 12,
        locale: NS
      },
      ShuorenhuaButton
    )
  );
}
return module.exports; } });
//# sourceMappingURL=client.js.map
