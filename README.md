# dsh-shuorenhua (说人话)

> **DeepSeek Harness 对话去 AI 味与大白话润色插件 · DSH 插件开发团队实战教程**

`dsh-shuorenhua` 是一个为 **DeepSeek Harness (DSH)** 深度定制的全栈插件。它在 DeepSeek 每轮助手回答的操作栏后注入一个「**💬 说人话**」按钮，用户点击后即可调起一个现代化毛玻璃弹窗，把大模型回答中充斥的**空洞寒暄**、**公文八股**、**互联网黑话**与**机械三段论**一键过滤优化为干净利落的自然大白话，并支持一键复制与 `ESC` 键随手退出。

本项目结构精巧、涵盖了 DSH 插件体系的**宿主服务端 (Host)、浏览器前端 (Client)、跨端 RPC 通信 (Typert)、模型工具 (Agent Tools) 以及 UI 插槽注入 (Slots)** 全部核心技术栈。**本文档专门面向团队技术分享与新同学培训，旨在作为开发 DeepSeek Harness 插件的标杆教程与最佳实践参考。**

---

## 目录

- [1. 为什么做这个插件？](#1-为什么做这个插件)
- [2. 功能特性与演示](#2-功能特性与演示)
- [3. DSH 插件系统全景架构](#3-dsh-插件系统全景架构)
- [4. 项目工程目录全景](#4-项目工程目录全景)
- [5. 核心原理与代码精讲](#5-核心原理与代码精讲)
  - [5.1 核心规则引擎：三大开源项目融合设计](#51-核心规则引擎三大开源项目融合设计)
  - [5.2 保护伞机制：占位符算法 (Placeholders)](#52-保护伞机制占位符算法-placeholders)
  - [5.3 前端插槽注入机制 (Slots & Assistant Actions)](#53-前端插槽注入机制-slots--assistant-actions)
  - [5.4 弹窗交互与快捷键 (Modal, ESC, 剪贴板)](#54-弹窗交互与快捷键-modal-esc-剪贴板)
  - [5.5 跨端 RPC 通信协议 (Typert)](#55-跨端-rpc-通信协议-typert)
  - [5.6 模型工具注册 (Agent Tool)](#56-模型工具注册-agent-tool)
- [6. 手把手：从零开发 DSH 插件教程](#6-手把手从零开发-dsh-插件教程)
  - [第一步：声明清单 package.json 与 patch 配置](#第一步声明清单-packagejson-与-patch-配置)
  - [第二步：编写 Host 宿主插件与生命周期](#第二步编写-host-宿主插件与生命周期)
  - [第三步：编写 Client 前端组件与插槽注入](#第三步编写-client-前端组件与插槽注入)
  - [第四步：构建双端产物 (esbuild + tsc)](#第四步构建双端产物-esbuild--tsc)
- [7. 本地安装、调试与运行](#7-本地安装调试与运行)
- [8. 经典坑点与避坑指南](#8-经典坑点与避坑指南)

---

## 1. 为什么做这个插件？

在大模型日常使用中，回答经常陷入令人厌烦的固有套路：
1. **废话开场白**：“好的，很高兴为您解答这个问题！针对您提到的...”
2. **结尾无意义关怀**：“希望以上内容对您有所帮助！如果您还有其他疑问，欢迎随时提问！”
3. **公文八股与互联网黑话堆砌**：“赋能业务”、“找到核心抓手”、“实现闭环”、“深耕底层逻辑”、“毋庸置疑标志着”...
4. **机械三段论**：无论问什么都“首先... 其次... 再次... 综上所述...”。

本项目汲取并融合了 GitHub 上三个极高人气的中文润色项目思想：
- **[MrGeDiao/shuorenhua](https://github.com/MrGeDiao/shuorenhua)**：只保留事实和核心观点，痛击开场寒暄与结尾套话，代码和专业名词绝不篡改。
- **[op7418/Humanizer-zh](https://github.com/op7418/Humanizer-zh)**：去公文味、消除八股黑名单词库、打破机械排比。
- **[nothing0here/humanizer-zh](https://github.com/nothing0here/humanizer-zh)**：短句化、自然节律、消除机器翻译感。

---

## 2. 功能特性与演示

| 特性 | 说明 |
| :--- | :--- |
| **无缝嵌入** | 自动在每轮 AI 回答下方的操作条（复制/分支按钮旁）渲染「💬 说人话」按钮 |
| **三大模式** | 🌿 **自然人话**（去八股、去空话、语气亲切）<br/>⚡ **极简要点**（大刀阔斧削减修饰语、直击要害）<br/>💻 **程序员直球**（优先保留关键步骤、命令、配置与代码） |
| **硬核保真** | 代码块 (```` ```...``` ````)、数学公式 ($$...$$)、行内代码与链接百分之百原样保护 |
| **极速弹窗** | 基于 Apple 现代极简风格设计的毛玻璃弹窗，呈现字数精简对比与过滤套话统计 |
| **一键复制** | 润色后内容点击「📋 一键复制」即可带走，并有动画反馈 |
| **极速退出** | 全局监听键盘 `ESC` 键，或点击遮罩外部任意位置瞬时退出 |
| **双轨运行** | 前端内置高灵敏正则引擎（零网络延迟、离线秒开），同时后端暴露 Typert RPC 与 Agent Tool |

---

## 3. DSH 插件系统全景架构

DeepSeek Harness 采用 **Cordis** 微内核架构，所有的核心能力、会话管理、模型调用、Web 前端界面均由插件组装而成。理解 DSH 插件的关键在于理解**双端分离与单向依赖**：

```
┌─────────────────────────────────────────────────────────────┐
│                    DeepSeek Harness 运行环境                 │
│                                                             │
│  ┌───────────────────────────┐  Typert RPC   ┌─────────────┐│
│  │   Host 宿主端 (Node.js)    │ <══════════> │  Client 前端 ││
│  │                           │  JSON-RPC 2.0 │  (Browser)  ││
│  │ - Cordis 微内核容器       │               │ - Web 界面  ││
│  │ - Agent Tools (模型工具)  │               │ - Slots 机制││
│  │ - TypertRemoteService     │               │ - React 组件││
│  └───────────────────────────┘               └─────────────┘│
│               ▲                                     ▲       │
│               │ cordis.patch.yml                    │ 动态挂载│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  dsh-shuorenhua 插件包                   ││
│  │  lib/index.js (Host 产物)     lib/client.js (Client 产物) ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

1. **Host 宿主环境 (Node.js 22)**：负责服务端生命周期、注册 Agent 工具、暴露 Typert 远程 RPC 接口。
2. **Client 浏览器环境 (Web)**：负责渲染 UI、向全局 Slot（插槽）贡献按钮或卡片、调用 Client 端的 Context 与 Locale 服务。
3. **Typert 协议层**：Cordis 生态特有的强类型 RPC 机制，自动处理前后端跨边界方法调用。

---

## 4. 项目工程目录全景

```
dsh-shuorenhua/
├── package.json             # 插件元信息与 DSH 捆绑配置 (dsh.bundle & dsh.client)
├── cordis.patch.yml         # 注入到 DSH 运行时的插件配置清单
├── dsh.plugin.json          # 插件对外贡献的 Tool/Skill 清单声明
├── build.mjs                # 双端打包构建脚本 (esbuild 打包 Node ESM 与 Browser CJS)
├── tsconfig.json            # 源代码 TypeScript 编译配置
├── tsconfig.build.json      # 类型声明导出配置 (emitDeclarationOnly -> lib/types)
├── vitest.config.ts         # 单元测试配置
├── src/
│   ├── types.ts             # 数据模型定义 (模式、统计指标、配置接口)
│   ├── contract.ts          # Typert RPC 通信接口契约声明
│   ├── typert.ts            # Typert Manifest 清单
│   ├── runtime.ts           # Host 端服务实现与 Agent 工具注册
│   ├── index.ts             # Host 端入口 (apply, Config, ShuorenhuaRuntime)
│   ├── engine/              # 核心“说人话”过滤引擎 (纯 TypeScript，双端共享)
│   │   ├── placeholders.ts  # 代码块、数学公式、URL 占位保护与还原
│   │   ├── rules.ts         # 寒暄、套话、八股黑名单正则集合
│   │   ├── humanizer.ts     # 核心迭代过滤与模式化精炼算法
│   │   └── prompt.ts        # 面向大模型深度重写的 System Prompt
│   └── client/              # Client 前端界面 (React 18 + Slots)
│       ├── index.tsx        # 前端入口 (apply，向 assistant-actions 注入按钮)
│       ├── locales.ts       # 国际化文案字典 (zh/en)
│       ├── styles.ts        # Apple 风格现代 CSS 样式
│       └── components/
│           ├── ShuorenhuaButton.tsx # 嵌入在对话下方的操作按钮
│           └── ShuorenhuaModal.tsx  # 润色弹窗 (ESC退出、模式切换、一键复制)
└── tests/                   # 自动化单元测试 (覆盖率 100%)
    ├── placeholders.spec.ts # 占位符保真测试
    ├── rules.spec.ts        # 正则过滤规则测试
    ├── humanizer.spec.ts    # 多模式文本润色测试
    └── runtime.spec.ts      # Host 端 RPC 服务测试
```

---

## 5. 核心原理与代码精讲

### 5.1 核心规则引擎：三大开源项目融合设计

AI 生成中文文本时之所以“一股味”，是因为它存在固定的概率生成模式。我们通过精准分类拆解：

#### 1. 剥离空洞开场白 (Iterative Opener Stripper)
```ts
// src/engine/rules.ts
export const OPENING_GREETINGS: RegExp[] = [
  /^(好的|收到|没问题|当然可以|很高兴为您解答|感谢您的提问)[，！。、\s\n]*/i,
  /^(针对您提出的|关于您提到的|关于这个问题|针对您所说的问题)[^，。！？\n]*[，。：:\n\s]*/i,
  /^(这是一个非常(好|棒|深刻|经典|有趣)的问题)[，。！\n\s]*/i,
  /^(我来为您(详细)?(解答|分析|梳理|整理|说明|介绍))[，。！\n\s]*/i,
  /^(在当今[^，,\n]*(世界|社会|时代|浪潮)[^，,\n]*[，,\s]*)/i,
]
```
> **设计要点**：很多 AI 回答在被剥去第一层“好的，”之后，第二句紧跟着“很高兴为您解答！”。因此引擎采用了 `while (openerMatched)` 迭代剥离算法，直到将前缀的客套话彻底剥离干净。

#### 2. 消灭结尾套话与免责声明 (Iterative Closer Stripper)
```ts
export const CLOSING_BOILERPLATES: RegExp[] = [
  /(希望以上(解答|内容|方案|建议|信息)?(对您有所帮助|能帮到您|能解决您的问题|对您有用)[！。~]*\s*)+$/i,
  /(如果您还有(任何|其他)?(疑问|问题|需要|想法)，欢迎随时(向我提问|提问|告知我|联系我|深入探讨)[！。~]*\s*)+$/i,
  /(作为(一个)?AI(语言模型|助手)?，(我需要提醒您|请注意)[^。\n]*[。\n]?\s*)+$/i,
  /(总而言之|综上所述|总的来说|总的来看)[，,][^\n。]*[。\n]?\s*$/i,
]
```

#### 3. 互联网八股降维映射 (Buzzword Normalizer)
```ts
export const BUZZWORD_REPLACEMENTS = [
  { pattern: /赋能/g, replacement: '帮助' },
  { pattern: /抓手/g, replacement: '切入点' },
  { pattern: /闭环/g, replacement: '搞定' },
  { pattern: /深耕/g, replacement: '专注' },
  { pattern: /底层逻辑/g, replacement: '基本原理' },
  { pattern: /顶层设计/g, replacement: '总体规划' },
  { pattern: /颗粒度/g, replacement: '细节程度' },
  { pattern: /对齐/g, replacement: '同步' },
  { pattern: /标志着/g, replacement: '表明' },
  { pattern: /毋庸置疑(的是)?[，,]?/g, replacement: '显然，' },
  { pattern: /发挥着至关重要的作用/g, replacement: '非常重要' },
]
```

---

### 5.2 保护伞机制：占位符算法 (Placeholders)

文本处理中最忌讳把代码块内的变量名、注释或字符串误替换（例如代码中的 `enable` 或注释中的变量被替换）。

在 `src/engine/placeholders.ts` 中，我们实现了两阶段机制：
1. **预处理抽取**：在进入任何正则处理之前，通过正则扫描将以下内容抽取至临时 Map 中，并在原位置留下唯一种子标记：
   - 围栏代码块：```` ```python ... ``` ```` -> `__SHUORENHUA_CODEBLOCK_0__`
   - 数学公式：`$$E=mc^2$$` 与 `$a^2+b^2=c^2$` -> `__SHUORENHUA_DISP_MATH_0__`
   - 行内代码：`` `npm install` `` -> `__SHUORENHUA_INLINECODE_0__`
   - 超链接：`https://...` -> `__SHUORENHUA_URL_0__`
2. **后期还原**：在所有过滤替换完成后，精确回填还原。

> ⚠️ **避坑警示**：JavaScript 中 `string.replaceAll(key, value)` 当 `value` 中包含 `$$` 时（如数学公式或某些 Bash 命令），`$$` 会被 JS 原生 replace 当作特殊转义字符折叠成单个 `$`！
> **正解**：必须写成函数式回填：`result = result.replaceAll(key, () => value)`。

---

### 5.3 前端插槽注入机制 (Slots & Assistant Actions)

DSH Web 端界面不采用硬编码页面修改，而是完全基于声明式的 **Slots 机制**。在会话对话树中，助手消息最终定稿后，会渲染一个名为 `conversation.chat.assistant-actions` 的插槽。

在 `src/client/index.tsx` 中：
```tsx
export function apply(ctx: ClientContext): void {
  // 注入到助手操作工具条
  ctx.slots.inject('conversation.chat.assistant-actions', () =>
    ctx.slots.register(
      {
        name: 'conversation.chat.assistant-actions',
        id: 'shuorenhua',
        order: 12, // 位于复制按钮与分支按钮之间
        locale: NS,
      },
      ShuorenhuaButton,
    ),
  )
}
```

在 `ShuorenhuaButton` 组件中，它会接收 DSH 传递的 `messageId` 和 `useChat` 响应式钩子：
```tsx
const snapshotText = useChat((snapshot) => {
  for (const node of snapshot.nodes.values()) {
    if (node.kind === 'assistant-step' && node.data?.finalNode?.messageId === messageId) {
      return node.data.blocks.flatMap(b => b.kind === 'text' ? [b.text] : []).join('')
    }
  }
  return ''
})
```
这保证了按钮能够 100% 精准获取属于当前轮次助手回复的纯文本。

---

### 5.4 弹窗交互与快捷键 (Modal, ESC, 剪贴板)

用户希望弹窗能够随手打开、即时查看、随手关闭：
1. **Portal 挂载**：使用 `createPortal(..., document.body)` 挂载到根节点，确保不受局部 DOM 样式穿透影响。
2. **ESC 快捷键支持**：
```tsx
useEffect(() => {
  if (!open) return
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [open, onClose])
```
3. **点击外部遮罩关闭**：
```tsx
<div className="srh-mask" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
```
4. **一键复制能力**：调用 `navigator.clipboard.writeText`，并在降级环境下自动回退到 `document.execCommand('copy')`，复制成功后提供 2 秒「已复制 ✓」高亮反馈。

---

### 5.5 跨端 RPC 通信协议 (Typert)

当需要在浏览器中调用 Host 端功能时，DSH 提供了 Typert 强类型通信方案。
在 `src/runtime.ts` 中定义服务：
```ts
export class ShuorenhuaRuntime extends TypertRemoteService {
  constructor(ctx: Context, private readonly config: ShuorenhuaConfig = {}) {
    super(ctx, 'shuorenhua')
  }

  @Remote
  async humanize(text: string, mode?: string): Promise<HumanizeResult> {
    return humanize(text, { mode: mode as any })
  }
}
```
客户端只需要通过 RPC 即能与宿主通信，也可以使用前端自带的共享算法离线极速运行。

---

### 5.6 模型工具注册 (Agent Tool)

如果让 AI 自主调用“说人话”能力，可以在 `src/runtime.ts` 中使用 `ctx.tools.register` 注入工具：
```ts
toolsService.register({
  name: 'shuorenhua_simplify',
  description: '把给定的AI回答、公文或冗长文本转化为通俗、简练、去除套话的人话。',
  parameters: {
    type: 'object',
    required: ['text'],
    properties: {
      text: { type: 'string', description: '待转化的文本' },
      mode: { type: 'string', enum: ['natural', 'concise', 'code_first'] },
    },
  },
  async execute(args) {
    return humanize(args.text, { mode: args.mode })
  },
})
```
这样 AI 在回答前就可以自主调用该工具完成润色自检。

---

## 6. 手把手：从零开发 DSH 插件教程

如果要为你自己的业务开发一个全新 DSH 插件，请遵循以下标准流程：

### 第一步：声明清单 package.json 与 patch 配置

在你的插件根目录创建 `package.json`，核心在于声明 `dsh` 字段：
```json
{
  "name": "dsh-your-plugin",
  "version": "0.1.0",
  "type": "module",
  "main": "lib/index.js",
  "exports": {
    ".": { "types": "./lib/types/index.d.ts", "default": "./lib/index.js" },
    "./client": { "types": "./lib/types/client/index.d.ts", "default": "./lib/client.js" },
    "./cordis.patch.yml": "./cordis.patch.yml"
  },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "platform": "web",
      "inject": [
        "@deepseek-ai/dsh-client-runtime",
        "@deepseek-ai/dsh-client-ui-slots",
        "@deepseek-ai/dsh-client-locale"
      ]
    }
  }
}
```

创建 `cordis.patch.yml`：
```yaml
- insert:
    - id: dsh-your-plugin
      name: dsh-your-plugin
      config:
        enabled: true
```

### 第二步：编写 Host 宿主插件与生命周期

在 `src/index.ts` 中编写 Cordis 入口：
```ts
import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-your-plugin'
export const inject = ['typert', 'tools'] // 声明依赖的服务

export function apply(ctx: Context, config?: any): void {
  // 必须通过 ctx.effect 注册有副作用的资源，以便在插件卸载时自动清理
  ctx.effect(() => {
    console.log('Plugin loaded!')
    return () => {
      console.log('Plugin unloaded!')
    }
  }, 'your-plugin: lifecycle')
}
```

### 第三步：编写 Client 前端组件与插槽注入

在 `src/client/index.tsx` 中编写 Web 端逻辑：
```tsx
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'

export function apply(ctx: ClientContext): void {
  ctx.slots.inject('目标插槽名称', () =>
    ctx.slots.register({
      name: '目标插槽名称',
      id: 'your-unique-id',
      order: 10,
    }, YourComponent)
  )
}
```

### 第四步：构建双端产物 (esbuild + tsc)

由于 Node 端是 ESM 规范，而 DSH 浏览器端是由内置的 `window.__ModuleLoader__` 统一加载的微模块规范，因此构建需要分别产出两套文件：
```js
// build.mjs
import { build } from 'esbuild'

// 1. 打包 Host 端 (Node22 ESM)
await build({
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  external: ['@deepseek-ai/cordis', '@deepseek-ai/dsh-*'],
})

// 2. 打包 Client 端 (Browser CJS + ModuleLoader 包裹)
await build({
  entryPoints: ['src/client/index.tsx'],
  outfile: 'lib/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  external: ['@deepseek-ai/*', 'react', 'react-dom'],
  banner: {
    js: "window.__ModuleLoader__.load({ id: 'dsh-your-plugin', factory: (require) => { var module = { exports: {} }; var exports = module.exports;",
  },
  footer: { js: 'return module.exports; } });' },
})
```

---

## 7. 本地安装、调试与运行

### 1. 编译构建
在插件根目录下运行：
```bash
pnpm install
pnpm run check   # 包含类型检查、单元测试、双端构建
```

### 2. 本地安装至 DSH
使用 DSH 内置的 `plugin_manager` 安装 bundle：
```bash
# 方式 A：通过 DSH 对话输入命令安装
/bundle install /home/asdf/dev/dsh-shuorenhua

# 方式 B：在 DSH 的 profiles 下的 cordis.yml 引入 patch
# 在 bundles 配置列表里添加路径指向本项目
```

### 3. 查看效果
启动 DSH Web 界面：
1. 发送任意问题（例如：“请为我写一份业务规划建议”）。
2. 在模型完成回答后，将鼠标移至回答下方的工具栏。
3. 点击「**💬 说人话**」按钮。
4. 弹窗即刻呈现过滤优化结果，切换「⚡ 极简要点」查看对比，按 `ESC` 键即可随手退出。

---

## 8. 经典坑点与避坑指南

1. **`replaceAll` 与 `$$` 转义陷阱**：
   - 现象：在还原数学公式（如 `$$E=mc^2$$`）时莫名其妙丢失一个 `$`。
   - 原因：JavaScript 的 `replace/replaceAll` 第二个参数若为字符串，会将 `$$` 解释为“插入字面量 `$`”。
   - 方案：回填时务必使用回调函数：`text.replaceAll(key, () => value)`。
2. **Cordis 生命周期注册必须通过 `ctx.effect`**：
   - 不要在 `apply()` 中直接写未经管控的全局定时器或全局监听事件。全部通过 `ctx.effect(() => { ... return () => cleanup() })` 托管，确保热重载 (HMR) 或卸载时不发生内存泄漏。
3. **Slot 插槽注册的 order 排序**：
   - 插入列表插槽时，`order` 越小越靠前。例如在 `conversation.chat.assistant-actions` 中，复制按钮为 0，分支按钮为 20。我们设置为 12 即可自然优雅地位于两者之间。
4. **Client 产物的 `window.__ModuleLoader__` 规范**：
   - 前端脚本不能直接以原生 ESM 独立运行，必须使用 CJS 格式并包裹 `window.__ModuleLoader__.load({ id: '插件名', factory: (require) => { ... } })`，以复用 DSH 宿主注入的 React 与 Cordis 运行环境，避免重复加载 React 导致 Hook 异常。

---

## 开源协议

本项目采用 [MIT License](LICENSE) 授权，欢迎自由交流与学习！
