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

// src/engine/placeholders.ts
function protectVerbatim(input) {
  const placeholders = /* @__PURE__ */ new Map();
  let counter = 0;
  let protectedContent = input;
  protectedContent = protectedContent.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, (match) => {
    const key = `__SHUORENHUA_CODEBLOCK_${counter++}__`;
    placeholders.set(key, match);
    return key;
  });
  protectedContent = protectedContent.replace(/(\$\$[\s\S]*?\$\$)/g, (match) => {
    const key = `__SHUORENHUA_DISP_MATH_${counter++}__`;
    placeholders.set(key, match);
    return key;
  });
  protectedContent = protectedContent.replace(/(\$[^$\n]+?\$)/g, (match) => {
    const key = `__SHUORENHUA_INLINE_MATH_${counter++}__`;
    placeholders.set(key, match);
    return key;
  });
  protectedContent = protectedContent.replace(/(`[^`\n]+?`)/g, (match) => {
    const key = `__SHUORENHUA_INLINECODE_${counter++}__`;
    placeholders.set(key, match);
    return key;
  });
  protectedContent = protectedContent.replace(/(https?:\/\/[^\s)>\]]+)/g, (match) => {
    const key = `__SHUORENHUA_URL_${counter++}__`;
    placeholders.set(key, match);
    return key;
  });
  return {
    text: protectedContent,
    placeholders
  };
}
function restoreVerbatim(text, placeholders) {
  let result = text;
  for (const [key, value] of placeholders.entries()) {
    result = result.replaceAll(key, () => value);
  }
  return result;
}

// src/engine/rules.ts
var OPENING_GREETINGS = [
  /^(好的|收到|没问题|当然可以|很高兴为您解答|感谢您的提问)[，！。、\s\n]*/i,
  /^(针对您提出的|关于您提到的|关于这个问题|针对您所说的问题)[^，。！？\n]*[，。：:\n\s]*/i,
  /^(这是一个非常(好|棒|深刻|经典|有趣)的问题)[，。！\n\s]*/i,
  /^(我来为您(详细)?(解答|分析|梳理|整理|说明|介绍))[，。！\n\s]*/i,
  /^(以下是为您(准备|整理|提供)的|下面为您详细介绍)[^：:\n]*[：:\n\s]*/i,
  /^(在当今[^，,\n]*(世界|社会|时代|浪潮)[^，,\n]*[，,\s]*)/i,
  /^(随着[^，,\n]*(飞速发展|迅猛发展|日益普及|不断进步|广泛应用)[^，,\n]*[，,\s]*)/i,
  /^(在(这个|如今)[^，,\n]*(时代|背景下)[，,\s]*)/i
];
var CLOSING_BOILERPLATES = [
  /(希望以上(解答|内容|方案|建议|信息)?(对您有所帮助|能帮到您|能解决您的问题|对您有用)[！。~]*\s*)+$/i,
  /(希望(对您有所帮助|能帮到您|能解决您的问题)[！。~]*\s*)+$/i,
  /(如果您还有(任何|其他)?(疑问|问题|需要|想法)，欢迎随时(向我提问|提问|告知我|联系我|深入探讨)[！。~]*\s*)+$/i,
  /(作为(一个)?AI(语言模型|助手)?，(我需要提醒您|请注意)[^。\n]*[。\n]?\s*)+$/i,
  /(请根据您的(实际情况|具体需求|业务场景)(进行调整|酌情参考|审慎选择)[！。]*\s*)+$/i,
  /(总而言之|综上所述|总的来说|总的来看)[，,][^\n。]*[。\n]?\s*$/i,
  /(如需进一步(了解|探讨|协助)，请随时(告诉我|留言)[！。~]*\s*)+$/i
];
var BUZZWORD_REPLACEMENTS = [
  { pattern: /赋能/g, replacement: "\u5E2E\u52A9", label: "\u8D4B\u80FD -> \u5E2E\u52A9" },
  { pattern: /抓手/g, replacement: "\u5207\u5165\u70B9", label: "\u6293\u624B -> \u5207\u5165\u70B9" },
  { pattern: /闭环/g, replacement: "\u641E\u5B9A", label: "\u95ED\u73AF -> \u641E\u5B9A" },
  { pattern: /深耕/g, replacement: "\u4E13\u6CE8", label: "\u6DF1\u8015 -> \u4E13\u6CE8" },
  { pattern: /打法/g, replacement: "\u505A\u6CD5", label: "\u6253\u6CD5 -> \u505A\u6CD5" },
  { pattern: /壁垒/g, replacement: "\u95E8\u69DB", label: "\u58C1\u5792 -> \u95E8\u69DB" },
  { pattern: /背书/g, replacement: "\u652F\u6301", label: "\u80CC\u4E66 -> \u652F\u6301" },
  { pattern: /底层逻辑/g, replacement: "\u57FA\u672C\u539F\u7406", label: "\u5E95\u5C42\u903B\u8F91 -> \u57FA\u672C\u539F\u7406" },
  { pattern: /顶层设计/g, replacement: "\u603B\u4F53\u89C4\u5212", label: "\u9876\u5C42\u8BBE\u8BA1 -> \u603B\u4F53\u89C4\u5212" },
  { pattern: /颗粒度/g, replacement: "\u7EC6\u8282\u7A0B\u5EA6", label: "\u9897\u7C92\u5EA6 -> \u7EC6\u8282\u7A0B\u5EA6" },
  { pattern: /对齐/g, replacement: "\u540C\u6B65", label: "\u5BF9\u9F50 -> \u540C\u6B65" },
  { pattern: /打通/g, replacement: "\u8FDE\u901A", label: "\u6253\u901A -> \u8FDE\u901A" },
  { pattern: /矩阵/g, replacement: "\u7EC4\u5408", label: "\u77E9\u9635 -> \u7EC4\u5408" },
  { pattern: /载体/g, replacement: "\u5F62\u5F0F", label: "\u8F7D\u4F53 -> \u5F62\u5F0F" },
  { pattern: /发力点/g, replacement: "\u91CD\u70B9", label: "\u53D1\u529B\u70B9 -> \u91CD\u70B9" },
  { pattern: /组合拳/g, replacement: "\u591A\u9879\u4E3E\u63AA", label: "\u7EC4\u5408\u62F3 -> \u591A\u9879\u4E3E\u63AA" },
  { pattern: /痛点/g, replacement: "\u96BE\u70B9", label: "\u75DB\u70B9 -> \u96BE\u70B9" },
  { pattern: /标志着/g, replacement: "\u8868\u660E", label: "\u6807\u5FD7\u7740 -> \u8868\u660E" },
  { pattern: /彰显了/g, replacement: "\u4F53\u73B0\u51FA", label: "\u5F70\u663E\u4E86 -> \u4F53\u73B0\u51FA" },
  { pattern: /凸显了/g, replacement: "\u8BF4\u660E", label: "\u51F8\u663E\u4E86 -> \u8BF4\u660E" },
  { pattern: /毋庸置疑(的是)?[，,]?/g, replacement: "\u663E\u7136\uFF0C", label: "\u6BCB\u5EB8\u7F6E\u7591 -> \u663E\u7136" },
  { pattern: /不可否认的是[，,]?/g, replacement: "\u786E\u5B9E\uFF0C", label: "\u4E0D\u53EF\u5426\u8BA4 -> \u786E\u5B9E" },
  { pattern: /显而易见的是[，,]?/g, replacement: "\u663E\u7136\uFF0C", label: "\u663E\u800C\u6613\u89C1 -> \u663E\u7136" },
  { pattern: /毫无疑问(的是)?[，,]?/g, replacement: "\u663E\u7136\uFF0C", label: "\u6BEB\u65E0\u7591\u95EE -> \u663E\u7136" },
  { pattern: /发挥着至关重要的作用/g, replacement: "\u975E\u5E38\u91CD\u8981", label: "\u81F3\u5173\u91CD\u8981 -> \u975E\u5E38\u91CD\u8981" },
  { pattern: /扮演着不可或缺的角色/g, replacement: "\u4E0D\u53EF\u6216\u7F3A", label: "\u4E0D\u53EF\u6216\u7F3A\u7684\u89D2\u8272 -> \u4E0D\u53EF\u6216\u7F3A" },
  { pattern: /值得注意的是[，,]?/g, replacement: "\u6CE8\u610F\uFF1A", label: "\u503C\u5F97\u6CE8\u610F -> \u6CE8\u610F" },
  { pattern: /需要指出的是[，,]?/g, replacement: "\u63D0\u793A\uFF1A", label: "\u9700\u8981\u6307\u51FA -> \u63D0\u793A" }
];
var FILLER_SENTENCES = [
  /在当今[^，,\n]*(世界|社会|时代|浪潮)[^，,\n]*[，,]/g,
  /随着[^，,\n]*(飞速发展|迅猛发展|日益普及|不断进步|广泛应用)[^，,\n]*[，,]/g,
  /在(这个|如今)[^，,\n]*(时代|背景下)[，,]/g
];

// src/engine/humanizer.ts
function humanize(input, options = {}) {
  const mode = options.mode ?? "natural";
  const rawInput = input ?? "";
  if (!rawInput.trim()) {
    return {
      text: "",
      original: rawInput,
      mode,
      stats: {
        originalLength: 0,
        humanizedLength: 0,
        savedPercentage: 0,
        removedOpeners: 0,
        removedClosers: 0,
        replacedBuzzwords: 0
      }
    };
  }
  const { text: protectedContent, placeholders } = protectVerbatim(rawInput);
  let processed = protectedContent.trim();
  let removedOpeners = 0;
  let removedClosers = 0;
  let replacedBuzzwords = 0;
  let openerMatched = true;
  while (openerMatched) {
    openerMatched = false;
    for (const regex of OPENING_GREETINGS) {
      if (regex.test(processed)) {
        processed = processed.replace(regex, "").trim();
        removedOpeners++;
        openerMatched = true;
      }
    }
  }
  let closerMatched = true;
  while (closerMatched) {
    closerMatched = false;
    for (const regex of CLOSING_BOILERPLATES) {
      if (regex.test(processed)) {
        processed = processed.replace(regex, "").trim();
        removedClosers++;
        closerMatched = true;
      }
    }
  }
  for (const regex of FILLER_SENTENCES) {
    if (regex.test(processed)) {
      processed = processed.replaceAll(regex, "");
    }
  }
  for (const item of BUZZWORD_REPLACEMENTS) {
    const matches = processed.match(item.pattern);
    if (matches && matches.length > 0) {
      replacedBuzzwords += matches.length;
      processed = processed.replaceAll(item.pattern, item.replacement);
    }
  }
  if (mode === "concise") {
    processed = processed.replace(/(^|\n)首先[，,]?\s*/g, "$11. ").replace(/(^|\n)其次[，,]?\s*/g, "$12. ").replace(/(^|\n)再次[，,]?\s*/g, "$13. ").replace(/(^|\n)最后[，,]?\s*/g, "$14. ").replace(/(^|\n)第一[，、]?\s*/g, "$11. ").replace(/(^|\n)第二[，、]?\s*/g, "$12. ").replace(/(^|\n)第三[，、]?\s*/g, "$13. ");
    processed = processed.replace(/[，,]?(总的来说|总而言之|综上所述)[，,]?/g, "").replace(/[，,]?(显而易见|毋庸置疑)[，,]?/g, "");
  } else if (mode === "code_first") {
    const lines = processed.split("\n");
    const filteredLines = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes("__SHUORENHUA_CODEBLOCK_")) {
        filteredLines.push(line);
        continue;
      }
      if (trimmed.startsWith("#") || trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("|") || /^\d+\./.test(trimmed) || trimmed.endsWith(":") || trimmed.endsWith("\uFF1A") || trimmed.includes("`") || trimmed.includes("__SHUORENHUA_")) {
        filteredLines.push(line);
      } else if (trimmed.length > 0 && trimmed.length < 80) {
        filteredLines.push(line);
      }
    }
    if (filteredLines.length > 0) {
      processed = filteredLines.join("\n");
    }
  }
  processed = processed.replace(/\n{3,}/g, "\n\n").trim();
  const finalResult = restoreVerbatim(processed, placeholders);
  const originalLength = rawInput.length;
  const humanizedLength = finalResult.length;
  const savedRatio = originalLength > 0 ? Math.max(0, Math.round((originalLength - humanizedLength) / originalLength * 100)) : 0;
  const stats = {
    originalLength,
    humanizedLength,
    savedPercentage: savedRatio,
    removedOpeners,
    removedClosers,
    replacedBuzzwords
  };
  return {
    text: finalResult,
    original: rawInput,
    mode,
    stats
  };
}

// src/client/components/ShuorenhuaModal.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function ShuorenhuaModal({
  open,
  onClose,
  originalText,
  t = (k) => k
}) {
  const [mode, setMode] = (0, import_react.useState)("natural");
  const [copied, setCopied] = (0, import_react.useState)(false);
  const [showDiff, setShowDiff] = (0, import_react.useState)(false);
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
  const result = (0, import_react.useMemo)(() => {
    return humanize(originalText, { mode });
  }, [originalText, mode]);
  const handleCopy = (0, import_react.useCallback)(async () => {
    if (!result.text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(result.text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = result.text;
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
  }, [result.text]);
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
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-mode-tabs", role: "tablist", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "button",
                    {
                      type: "button",
                      className: `srh-mode-tab ${mode === "natural" ? "srh-mode-tab-active" : ""}`,
                      onClick: () => setMode("natural"),
                      children: [
                        "\u{1F33F} ",
                        t("mode.natural")
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "button",
                    {
                      type: "button",
                      className: `srh-mode-tab ${mode === "concise" ? "srh-mode-tab-active" : ""}`,
                      onClick: () => setMode("concise"),
                      children: [
                        "\u26A1 ",
                        t("mode.concise")
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "button",
                    {
                      type: "button",
                      className: `srh-mode-tab ${mode === "code_first" ? "srh-mode-tab-active" : ""}`,
                      onClick: () => setMode("code_first"),
                      children: [
                        "\u{1F4BB} ",
                        t("mode.code_first")
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-stats-pills", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-pill", children: [
                    t("stats.original"),
                    ": ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: result.stats.originalLength })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-pill", children: [
                    t("stats.humanized"),
                    ": ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: result.stats.humanizedLength })
                  ] }),
                  result.stats.savedPercentage > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-pill-badge", children: [
                    "-",
                    result.stats.savedPercentage,
                    "%"
                  ] }),
                  result.stats.replacedBuzzwords > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-pill", children: [
                    t("stats.buzzwords"),
                    ": ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: result.stats.replacedBuzzwords })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "srh-content", children: showDiff ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-diff-grid", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-diff-pane", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "srh-diff-label", children: t("stats.original") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "srh-diff-box", children: originalText || t("empty.tip") })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-diff-pane", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-diff-label", children: [
                    t("stats.humanized"),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "srh-pill-badge", children: [
                      "-",
                      result.stats.savedPercentage,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "srh-diff-box", children: result.text || t("empty.tip") })
                ] })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "srh-text-box", children: result.text || t("empty.tip") }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-footer", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-esc-tip", children: [
                  "\u6309 ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { className: "srh-esc-kbd", children: "ESC" }),
                  " \u5FEB\u901F\u9000\u51FA"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "srh-btn-row", children: [
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
  const buttonRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    ensureStylesInjected();
  }, []);
  const snapshotText = typeof useChat === "function" ? useChat((snapshot) => {
    if (!snapshot || !snapshot.nodes || typeof snapshot.nodes.values !== "function") {
      return "";
    }
    try {
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
    } catch {
    }
    return "";
  }) : "";
  const handleClick = (0, import_react2.useCallback)(() => {
    setModalOpen(true);
  }, []);
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
            if (text && text.length > 5) {
              return text;
            }
            prev = prev.previousElementSibling;
          }
        }
      } catch {
      }
    }
    return snapshotText || "";
  }, [snapshotText]);
  const targetText = modalOpen ? resolveTargetText() : "";
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
  "action.tooltip": "\u8BF4\u4EBA\u8BDD \xB7 \u53BB AI \u5473\u6DA6\u8272",
  "modal.title": "\u8BF4\u4EBA\u8BDD \xB7 \u53BB AI \u5473\u6DA6\u8272",
  "modal.desc": "\u57FA\u4E8E\u4E09\u5927\u5F00\u6E90\u89C4\u5219\uFF08shuorenhua + Humanizer-zh + \u81EA\u7136\u8282\u5F8B\uFF09\u4E00\u952E\u6D88\u9664AI\u7A7A\u8BDD\u5BD2\u6684\u4E0E\u516C\u6587\u516B\u80A1",
  "mode.natural": "\u81EA\u7136\u4EBA\u8BDD",
  "mode.concise": "\u6781\u7B80\u8981\u70B9",
  "mode.code_first": "\u7A0B\u5E8F\u5458\u76F4\u7403",
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
  "empty.tip": "\u6682\u672A\u83B7\u53D6\u5230\u672C\u8F6E\u56DE\u7B54\u7684\u6587\u672C\u5185\u5BB9"
};
var en = {
  "action.button": "Humanize",
  "action.tooltip": "Speak Human \xB7 De-AI & Simplify",
  "modal.title": "Speak Human \xB7 De-AI & Simplify",
  "modal.desc": "Prune AI fluff, corporate jargon, and opening/closing clich\xE9s into clean human speech.",
  "mode.natural": "Natural",
  "mode.concise": "Concise",
  "mode.code_first": "Code-First",
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
