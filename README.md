# dsh-shuorenhua (说人话)

> **DeepSeek Harness (DSH) 插件开发核心机制与接入落地实战指南**
> 本文面向技术团队与全栈/前端工程师，以 `dsh-shuorenhua` 插件为真实蓝本，深度拆解 DSH 的全插件（All-Plugin）微内核架构、双端执行环境、生命周期管理、跨端流式通信与 UI 插槽机制，作为团队开发 DSH 扩展的标杆教程与实战参考。

---

## 目录

- [1. 插件概述与落地场景](#1-插件概述与落地场景)
- [2. DSH 插件系统核心架构剖析](#2-dsh-插件系统核心架构剖析)
  - [2.1 DSH 插件体系介绍：基于 Cordis 的全插件微内核](#21-dsh-插件体系介绍基于-cordis-的全插件微内核)
  - [2.2 与普通插件的区别 (VSCode / Webpack / Chrome / 后端中间件)](#22-与普通插件的区别-vscode--webpack--chrome--后端中间件)
  - [2.3 DSH 插件的生命周期与副作用管理 (Fibers & Effects)](#23-dsh-插件的生命周期与副作用管理-fibers--effects)
  - [2.4 跨端通信机制：为什么不用新端口也能实现打字机实时流式？](#24-跨端通信机制为什么不用新端口也能实现打字机实时流式)
  - [2.5 服务依赖与注册机制 (Inject / Provide / Probing)](#25-服务依赖与注册机制-inject--provide--probing)
  - [2.6 前端插槽机制 (UI Slots & Assistant Actions)](#26-前端插槽机制-ui-slots--assistant-actions)
  - [2.7 浏览器微模块加载机制 (dsh.client 与 ModuleLoader)](#27-浏览器微模块加载机制-dshclient-与-moduleloader)
- [3. 本插件 (dsh-shuorenhua) 源码工程落地详解](#3-本插件-dsh-shuorenhua-源码工程落地详解)
  - [3.1 工程目录与双端职责划分](#31-工程目录与双端职责划分)
  - [3.2 宿主端入口：依赖注入与条件扩展 (src/index.ts)](#32-宿主端入口依赖注入与条件扩展-srcindexts)
  - [3.3 核心服务实现：宿主 LLM 流式调度 (src/runtime.ts)](#33-核心服务实现宿主-llm-流式调度-srcruntimets)
  - [3.4 前端界面接入：插槽注入与响应式上下文 (src/client/...)](#34-前端界面接入插槽注入与响应式上下文-srcclient)
  - [3.5 双端构建脚本设计：Node ESM 与 Browser CJS 打包 (build.mjs)](#35-双端构建脚本设计node-esm-与-browser-cjs-打包-buildmjs)
- [4. 本地挂载、调试与快速上手](#4-本地挂载调试与快速上手)
- [5. 经典踩坑点与排障实战指南 (FAQ)](#5-经典踩坑点与排障实战指南-faq)

---

## 1. 插件概述与落地场景

大语言模型在日常生成长篇回答时，普遍存在客套寒暄、八股公文词汇、过度排比与空洞三段论等典型“AI 味”。

`dsh-shuorenhua` 是为 **DeepSeek Harness (DSH)** 研发的全栈去 AI 味润色插件。它具备以下产品级表现：
- **无缝嵌入助手气泡**：在每轮 AI 回答完成后的操作工具条中动态渲染「**💬 说人话**」按钮。
- **实时打字机流式呈现**：用户点击后即刻唤起 Apple 风格毛玻璃弹窗，直接复用宿主底层大模型进行去八股润色，逐字流式打字机输出，呈现字数精简对比。
- **纯粹极简交互**：开箱即润色，支持一键带走结果与全局 `ESC` 键无感知瞬时退出。
- **双模能力支撑**：同时提供面向 Web 用户的交互式界面，以及面向自主 Agent 的 `shuorenhua_simplify` 专属工具调用能力。

更重要的是，本项目是深入学习 DSH 插件体系的理想样本：它**同时跨越了 Node.js 宿主端（服务端）与 Browser 浏览器端（客户端）**，完整覆盖了服务注入、SSE 路由挂载、UI 插槽拦截、双端微模块构建的全流程。

---

## 2. DSH 插件系统核心架构剖析

### 2.1 DSH 插件体系介绍：基于 Cordis 的全插件微内核

DeepSeek Harness 采用了彻底的 **All-Plugin（全插件）微内核架构**，其核心底层由 Cordis 框架驱动。

在传统的软件系统设计中，通常存在一个庞大而拥有特权的“Core 核心层”，第三方通过受限的 API 往核心里塞逻辑。但在 DSH 中：
- **没有特权核心**：不管是模型提供层 (`ctx.llm`)、文件读写 (`ctx.fs`)、工具注册中心 (`ctx.tools`)、会话记录器 (`ctx.sessions`)、系统提示词装配 (`ctx.systemPrompt`)，还是前端 Web 界面、甚至 Agent 主循环本身 (`ctx.agentLoop`)，**统统都是平等挂载在 Cordis 树上的独立插件**。
- **拓扑依赖驱动 (Dependency Topology)**：插件之间的加载不是按照硬编码的先来后到，而是按照声明的服务依赖关系（Service Graph）由引擎自动进行拓扑排序并异步激活。
- **双端对齐 (Host-Client Bifacial)**：DSH 将一个完整的插件定义为“宿主环境（Host）”与“浏览器环境（Client）”两个对等的运行面。同一个插件既能在后端控制进程与模型，也能在前端控制页面视图。

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DeepSeek Harness 全局上下文 (Context)                │
│                                                                         │
│  ┌───────────────────────────────┐     SSE / RPC      ┌────────────────┐│
│  │     Host 宿主环境 (Node.js)    │ <════════════════> │  Client 浏览器  ││
│  │                               │   (同端口 3080)    │   (React / UI) ││
│  │  - ctx.llm (大模型流式调用)   │                    │  - ctx.slots   ││
│  │  - ctx.webServer (路由挂载)   │                    │  - ctx.locale  ││
│  │  - ctx.tools (Agent 工具集)   │                    │  - 状态树 useChat││
│  │  - ShuorenhuaRuntime (RPC)    │                    │  - 弹窗与交互    ││
│  └───────────────────────────────┘                    └────────────────┘│
│                  ▲                                             ▲        │
│                  │ (cordis.patch.yml)                          │        │
│  ┌───────────────┴─────────────────────────────────────────────┴──────┐ │
│  │                      dsh-shuorenhua 插件包                          │ │
│  │     lib/index.js (Host 产物)         lib/client.js (Client 产物)    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 与普通插件的区别 (VSCode / Webpack / Chrome / 后端中间件)

为了让习惯不同技术栈的同学快速建立认知，下表对比了 DSH 插件与其他常见插件体系的本质区别：

| 维度 | VSCode 插件 | Chrome 扩展 | Webpack / Vite 插件 | Express / Koa 中间件 | **DSH 插件 (Cordis)** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **运行物理边界** | 单独的 Extension Host 进程，与界面 iframe 跨进程序列化 IPC | Content Script + Background Service Worker，隔离严重 | 纯构建编译期执行，不进入生产运行时 | 服务端单一线性调用链 | **双端同体**：后端参与 Node.js 宿主微内核，前端注入单页 Web DOM |
| **执行时序控制** | 声明静态激活事件 (activationEvents) | 匹配网页 URL 注入执行 | 固定的编译生命周期 Hook 钩子 | `app.use()` 严格依赖代码书写顺序 | **服务拓扑依赖**：只要依赖的 Service 未就绪，插件自动处于 PENDING 挂起 |
| **UI 扩展能力** | 仅限侧边栏/状态栏/Webview 窗格，无法侵入原生编辑器 | DOM 暴力注入，容易受目标网页样式污染 | 无 UI 能力 | 无 UI 能力 | **声明式 Slots 插槽**：原生级无缝嵌入核心聊天流，继承主题与设计系统 |
| **通信机制** | 内部私有 RPC 通信 | `chrome.runtime.sendMessage` | 进程内内存共享 | 函数传参 `(req, res, next)` | **同端口多路复用**：支持同端口 WebServer SSE 流与强类型 Typert RPC |
| **热插拔与清理** | 需重载窗口或杀死进程 | 需要用户刷新整个页面 | 重新触发局部热更新 | 无法在运行时安全热拔插 | **全生命周期可逆 Effect**：卸载插件时，注册的路由、工具、UI 元素自动连根拔起 |

---

### 2.3 DSH 插件的生命周期与副作用管理 (Fibers & Effects)

理解 DSH 插件运作机制的关键在于理解两个概念：**Fiber（纤程/执行上下文）** 与 **Effect（可逆副作用）**。

#### 1. 插件生命周期状态机

每一个由 Loader 载入的插件，在 Cordis 内部被封装为一个 Fiber 节点，其状态流转如下：

```
               满足 inject 依赖
  [ PENDING ] ─────────────────> [ ACTIVE ] ─── 卸载/依赖消失 ───> [ DISPOSED ]
       ▲                              │
       └──── 依赖服务临时被拔出 ────────┘
```

- **`PENDING`（挂起就绪）**：当插件被配置文件声明，但其依赖的 `inject` 服务（例如 `llm`）尚未挂载完成时，插件 Fiber 进入挂起状态。此时插件的 `apply()` 函数**绝对不会被调用**，从根源上杜绝了因为依赖未就绪导致的空指针崩溃。
- **`ACTIVE`（已激活）**：一旦所有必需服务就绪，引擎自动调用插件导出的 `apply(ctx, config)` 函数，插件开始挂载其服务与能力。
- **`DISPOSED`（已注销）**：插件被主动卸载，或者当某个被依赖的基础服务发生热替换时，Fiber 被销毁。

#### 2. 核心铁律：所有注册必须是 Effect

在传统 Node 开发中，开发者容易写出 `httpServer.on(...)` 或 `setInterval(...)` 这种没有清理手段的代码。一旦发生模块热替换，老事件监听器便常驻内存引发泄露。

在 DSH 规范中：**一切注册必须通过 `ctx.effect()` 或其封装方法进行**：

```ts
// src/index.ts 典型范式
export function apply(ctx: Context, config?: Config): void {
  // 必须返回一个 Disposer 清理函数
  ctx.effect(() => {
    console.log('Shuorenhua plugin activated')
    return () => {
      // 当插件被卸载、热重载、或者父级 Fiber 销毁时，系统自动调用此处
      console.log('Shuorenhua plugin cleaned up cleanly')
    }
  }, 'dsh-shuorenhua: lifecycle')
}
```
当系统热重载配置或卸载本插件时，Cordis 会自底向上自动逆向执行每一个注册返回的 Disposer，瞬间恢复干净环境。

---

### 2.4 跨端通信机制：为什么不用新端口也能实现打字机实时流式？

在很多同类插件方案中，开发者由于搞不定跨端通信，往往在 Node 侧单独用 Express 开一个 `3001` 或 `8080` 端口，导致跨域 CORS、端口冲突、防火墙拦截等一堆问题。

`dsh-shuorenhua` 演示了两种 DSH 标准通信机制的协同设计：

#### 方案 A：WebServer SSE 流式路由（首选主通道）
DSH 宿主内部启动了统一的 Web 服务器（来自 `@deepseek-ai/dsh-host-webserver` 服务），默认监听在 `3080`。本插件直接复用该服务注册 SSE 路由：

```ts
// src/runtime.ts
export function registerShuorenhuaWebServer(ctx: Context, config: ShuorenhuaConfig = {}): () => void {
  const webServer = ctx.get('webServer')
  if (!webServer || typeof webServer.register !== 'function') return () => {}

  // 直接将路由挂载在 DSH 既有的 WebServer 上，同域同端口！
  return webServer.register({
    kind: 'exact',
    path: '/shuorenhua/stream',
    handler: async (req: IncomingMessage, res: ServerResponse) => {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const controller = new AbortController()
      req.on('close', () => controller.abort())

      for await (const delta of streamHumanize(ctx, text, config, controller.signal)) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`)
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      res.end()
    },
  })
}
```
前端浏览器只需 `fetch('/shuorenhua/stream')`，即可直接消费 Server-Sent Events，以打字机速度逐 Token 实时刷屏，**不占用任何额外端口，不触发跨域预检**。

#### 方案 B：Typert RPC 通信（结构化回退通道）
DSH 提供了名为 **Typert** 的强类型 RPC 协议（基于 JSON-RPC 2.0 / WebSocket），用于前后端方法级直接调用：
```ts
export class ShuorenhuaRuntime extends TypertRemoteService {
  @Remote
  async humanize(text: string): Promise<HumanizeResult> { ... }
}
```
如果客户端所处环境不支持流式传输，前端可自动降级调用 `/api/shuorenhua/humanize` 远程方法，形成容灾闭环。

---

### 2.5 服务依赖与注册机制 (Inject / Provide / Probing)

DSH 对服务依赖的严谨性极高，`ctx` 对象在底层被一个 Proxy 完全代理。深入理解以下三种服务操作方式，是杜绝各种奇怪报错的前提：

#### 1. 静态强依赖声明 (`export const inject = [...]`)
```ts
export const inject = ['llm']
```
- **含义**：告诉 Cordis，“没有 LLM 服务的支持，我这个插件毫无意义”。
- **表现**：Cordis 会将本插件维持在 `PENDING`，直到系统成功挂载了至少一个提供 `llm` 的插件（如 `@deepseek-ai/dsh-llm`）。
- **注意**：**严禁把可选服务放入静态 inject**，否则只要该可选服务在当前 Profile 中未安装，你的插件将永远处于挂起状态而无法执行！

#### 2. 动态条件注入 (`ctx.inject([...], callback)`)
```ts
// 当且仅当当前环境挂载了 WebServer 服务时，才执行包裹的代码
ctx.inject(['webServer'], (webCtx) => {
  webCtx.effect(
    () => registerShuorenhuaWebServer(webCtx, resolved),
    'dsh-shuorenhua: webserver route',
  )
})
```
- **含义**：用于可选的子功能。比如当前如果是在纯 CLI 运行的 Headless 模式，系统中根本没有 `webServer`；通过 `ctx.inject(['webServer'])`，在 Headless 下这部分代码静默跳过，但在 Web Profile 下就会自动激活。

#### 3. 运行时可选服务安全探测 (`ctx.get('serviceName')`)
```ts
// 错误写法：直接访问 ctx.agentDefaultModel
// 结果：Proxy 拦截器抛出 Error: cannot get property "agentDefaultModel" without inject

// 正确规范写法：使用 ctx.get(...)
const defaultModelService = ctx.get('agentDefaultModel')
if (defaultModelService && typeof defaultModelService.currentSelection === 'function') {
  const selection = defaultModelService.currentSelection()
  provider = selection?.provider
}
```
- **含义**：在代码运行阶段，探测系统中是否有某个服务。
- **机制**：`ctx.get()` 直接从内部活动服务表中安全读取，绝不触发 Proxy 的 `inject` 静态校验；如果服务不存在，直接安全返回 `undefined`，绝不抛错。

---

### 2.6 前端插槽机制 (UI Slots & Assistant Actions)

DSH Web 前端绝不允许硬编码修改主页对话流。所有界面拓展点均使用声明式 **Slots（插槽）** 机制。

#### 1. 插槽声明与注册
在 DSH 的对话流中，每轮助手消息（Assistant Message）定稿后，底部操作条会暴露名为 `conversation.chat.assistant-actions` 的插槽：

```tsx
// src/client/index.tsx
export function apply(ctx: ClientContext): void {
  // 向助手操作工具条注入自定义按钮组件
  ctx.slots.inject('conversation.chat.assistant-actions' as any, () =>
    ctx.slots.register(
      {
        name: 'conversation.chat.assistant-actions' as any,
        id: 'shuorenhua', // 唯一标识符
        order: 12,        // 排序权重：复制按钮为0，分支按钮为20，设为12恰好居中排布
        locale: NS,       // 绑定的国际化命名空间
      },
      ShuorenhuaButton as any,
    ),
  )
}
```

#### 2. 从 DSH 会话树中响应式获取消息内容
插槽在渲染组件时，会自动向下传递当前上下文属性（包含当前气泡的 `messageId` 与状态提取 Hook `useChat`）：

```tsx
// src/client/components/ShuorenhuaButton.tsx
export function ShuorenhuaButton({ messageId, useChat }: ShuorenhuaButtonProps) {
  // 响应式监听当前会话树快照，精准剥离当前轮次的文本内容
  const snapshotText = typeof useChat === 'function'
    ? useChat((snapshot) => {
        if (!snapshot?.nodes) return ''
        for (const node of snapshot.nodes.values()) {
          if (node.kind === 'assistant-step' && node.data?.finalNode?.messageId === messageId) {
            return node.data.blocks
              .flatMap((b: any) => (b.kind === 'text' ? [b.text] : []))
              .join('')
          }
        }
        return ''
      })
    : ''
  // ...
}
```
这种设计确保了插件按钮对会话状态的感知完全是响应式、精准且无污染的。

---

### 2.7 浏览器微模块加载机制 (dsh.client 与 ModuleLoader)

很多刚接触 DSH 的前端同学会困惑：“为什么前端不能直接用 Vite/Webpack 打包一个普通的 JS 文件，直接 script 引入？”

#### 1. 痛点：依赖孤岛与 React 多实例灾难
如果第三方插件自己把 React、ReactDOM、Emotion 打包进自己的 bundle，会导致浏览器中同时运行多个不同的 React 实例。其致命后果是：**React Context 失效、Hooks 报错、主应用的深色浅色主题变量无法透传、内存急剧膨胀**。

#### 2. DSH 的解法：ModuleLoader 共享运行时
DSH 前端内置了一套微模块加载器 `window.__ModuleLoader__`，它在浏览器启动时提供了一组被称为 `PLATFORM_MODULES` 的预置基座（包含单例 React、ReactDOM、Cordis 客户端核心、UI Primitives 等）。

插件在 `package.json` 中通过 `dsh.client` 进行契约声明：
```json
{
  "dsh": {
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
DSH 宿主在启动时扫描该声明，并对外暴露 `/plugins/dsh-shuorenhua/client.js`。
客户端打包产物通过外层 Factory 包装函数，在运行时按需索取主程序的 React 实例：
```js
window.__ModuleLoader__.load({
  id: 'dsh-shuorenhua',
  factory: (require) => {
    // 这里的 require('react') 取到的是 DSH 主应用的单一实例！
    var module = { exports: {} };
    // ... 插件逻辑
    return module.exports;
  }
});
```

---

## 3. 本插件 (dsh-shuorenhua) 源码工程落地详解

### 3.1 工程目录与双端职责划分

```
dsh-shuorenhua/
├── package.json             # 插件清单，声明 dsh.bundle 与 dsh.client
├── cordis.patch.yml         # 注入到 DSH 运行时的编排补丁 (Patch)
├── build.mjs                # 双端自研打包管线 (Host ESM + Browser CJS)
├── tsconfig.json            # 源码 TypeScript 配置
├── tsconfig.build.json      # 类型声明分发配置 (emitDeclarationOnly -> lib/types)
├── vitest.config.ts         # 单元测试配置 (100% 覆盖)
├── src/
│   ├── types.ts             # 核心类型契约定义
│   ├── typert.ts            # Typert RPC 契约清单
│   ├── index.ts             # 【Host 入口】生命周期控制与服务条件挂载
│   ├── runtime.ts           # 【Host 核心】调用 ctx.llm 与注册 /shuorenhua/stream
│   ├── engine/              # 【核心规则库】双端通用去八股算法与 System Prompt
│   │   ├── placeholders.ts  # 代码块、公式、URL 的防污染占位与还原
│   │   ├── rules.ts         # 常见客套开场、结尾免责声明正则库
│   │   ├── humanizer.ts     # 核心本地清洗引擎
│   │   └── prompt.ts        # 宿主 LLM 流式调用的系统级提示词
│   └── client/              # 【Client 入口】浏览器渲染层
│       ├── index.tsx        # 前端 apply 入口，挂载 assistant-actions 插槽
│       ├── locales.ts       # 国际化字典 (zh/en)
│       ├── styles.ts        # 适配深浅双色主题的高性能 CSS 样式
│       └── components/
│           ├── ShuorenhuaButton.tsx # 嵌入在操作条的按钮
│           └── ShuorenhuaModal.tsx  # 流式打字机弹窗组件 (ESC关闭、一键复制)
└── tests/                   # 自动化单元测试集
```

---

### 3.2 宿主端入口：依赖注入与条件扩展 (src/index.ts)

```ts
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { registerShuorenhuaTools, registerShuorenhuaWebServer, ShuorenhuaRuntime } from './runtime.ts'
import { TYPERT_MANIFEST } from './typert.ts'
import type { ShuorenhuaConfig } from './types.ts'

export const name = 'dsh-shuorenhua'

// 1. 声明硬依赖：仅强依赖 llm 服务
export const inject = ['llm']

// 2. 声明配置 Schema (可在 cordis.patch.yml 中配置)
export const Config = z.object({
  provider: z.string(),
  model: z.string(),
  enableTool: z.boolean().default(true),
})

export function apply(ctx: Context, config?: Config): void {
  const resolved = Config(config ?? {}) as ShuorenhuaConfig

  // 3. 挂载 Host 侧 Typert RPC 远程服务
  new ShuorenhuaRuntime(ctx, resolved)

  // 4. 响应式条件注入：仅在存在 webServer 的环境中挂载 SSE 流式端点
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(
      () => registerShuorenhuaWebServer(webCtx, resolved),
      'dsh-shuorenhua: webserver route',
    )
  })

  // 5. 响应式条件注入：仅在存在 tools 的环境中挂载 Agent 润色工具
  if (resolved.enableTool !== false) {
    ctx.inject(['tools'], (toolCtx) => {
      toolCtx.effect(
        () => registerShuorenhuaTools(toolCtx, resolved),
        'dsh-shuorenhua: agent tools',
      )
    })
  }
}
```

---

### 3.3 核心服务实现：宿主 LLM 流式调度 (src/runtime.ts)

调用宿主底层大模型进行流式文本重写：

```ts
export async function* streamHumanize(
  ctx: Context,
  text: string,
  config: ShuorenhuaConfig = {},
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const llmService = ctx.get('llm')
  if (!llmService || typeof llmService.stream !== 'function') {
    throw new Error('DSH 宿主 LLM 服务未就绪，请检查模型提供方配置')
  }

  // 1. 安全探测当前会话默认使用的模型 (通过 ctx.get，绝不触发 Proxy 报错)
  let provider = config.provider
  let model = config.model
  const defaultModelService = ctx.get('agentDefaultModel')
  if ((!provider || !model) && defaultModelService?.currentSelection) {
    const selection = defaultModelService.currentSelection()
    provider = provider || selection?.provider
    model = model || selection?.model
  }
  provider = provider || 'deepseek-official'
  model = model || 'deepseek-chat'

  // 2. 构造符合 DSH 规范的 Message 结构体，发起流式调用
  const stream = llmService.stream({
    provider,
    model,
    system: HUMANIZER_SYSTEM_PROMPT,
    messages: [
      {
        id: `msg-${Date.now()}` as any,
        role: 'user',
        source: { kind: 'user' },
        content: [{ type: 'text', text }],
      },
    ],
    temperature: 0.4,
    signal,
  })

  // 3. 消费 chunk 并逐字向上层 yield 文本增量
  let hasYielded = false
  for await (const chunk of stream) {
    if (chunk.type === 'text-delta' && typeof chunk.text === 'string') {
      yield chunk.text
      hasYielded = true
    } else if (chunk.type === 'finish' && chunk.reason?.kind === 'error') {
      throw new Error(`[${provider}/${model}] ${chunk.reason.failure?.message || 'LLM 调用失败'}`)
    }
  }

  if (!hasYielded && !signal?.aborted) {
    throw new Error(`[${provider}/${model}] 模型未返回任何生成文本，请检查配置`)
  }
}
```

---

### 3.4 前端界面接入：插槽注入与响应式上下文 (src/client/...)

#### 1. 前端插件初始化 (`src/client/index.tsx`)
```tsx
export const name = 'dsh-shuorenhua'
export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext): void {
  // 注册双语词典
  ctx.effect(() => {
    const localeService = ctx.get('locale')
    if (localeService) return localeService.register(NS, { zh, en })
  }, 'dsh-shuorenhua: dictionaries')

  // 注册操作栏插槽
  ctx.slots.inject('conversation.chat.assistant-actions' as any, () =>
    ctx.slots.register(
      {
        name: 'conversation.chat.assistant-actions' as any,
        id: 'shuorenhua',
        order: 12,
        locale: NS,
      },
      ShuorenhuaButton as any,
    ),
  )
}
```

#### 2. 流式弹窗组件细节 (`src/client/components/ShuorenhuaModal.tsx`)
- **自动打开即生成**：弹窗一经触发立刻创建 `AbortController` 并发起 `fetch('/shuorenhua/stream')`，读取 ReadableStream 渲染打字机动画。
- **键盘无障碍监听**：监听 `Escape` 键，点击遮罩外部均执行安全卸载并 Abort 请求。
- **自适应深浅主题**：采用 DSH 原生的 CSS 变量（如 `var(--dsw-alias-bg-layer-1)` 与 `body[data-ds-dark-theme]` 选择器），完美与主应用 Light/Dark 模式契合。

---

### 3.5 双端构建脚本设计：Node ESM 与 Browser CJS 打包 (build.mjs)

由于 Host 与 Client 的运行环境截然不同，构建脚本使用 `esbuild` 双重编译：

```js
// build.mjs
import { build } from 'esbuild'

// 1. 打包 Host 端：纯 ESM 模块规范，面向 Node.js 22 运行
await build({
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  external: [
    '@deepseek-ai/cordis',
    '@deepseek-ai/schemastery',
    '@deepseek-ai/dsh-*',
  ],
})

// 2. 打包 Client 端：CJS 规范，包裹 window.__ModuleLoader__ 注入头尾
await build({
  entryPoints: ['src/client/index.tsx'],
  outfile: 'lib/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  external: ['@deepseek-ai/*', 'react', 'react-dom'],
  banner: {
    js: "window.__ModuleLoader__.load({ id: 'dsh-shuorenhua', factory: (require) => { var module = { exports: {} }; var exports = module.exports;",
  },
  footer: {
    js: 'return module.exports; } });',
  },
})
```

---

## 4. 本地挂载、调试与快速上手

### 步骤 1：本地依赖安装与产物构建
```bash
# 进入插件目录
cd /home/asdf/dev/dsh-shuorenhua

# 运行全套检查（类型检查 + 单元测试 + 双端打包）
pnpm run check
```

### 步骤 2：创建软链接接入 DSH Profiles
将插件软链接至 DSH 对应的 Web profile 中，供 Loader 寻址：
```bash
# 将当前包软链接到 web profile 的 node_modules 中
mkdir -p ~/.dsh/profiles/web/node_modules
ln -s /home/asdf/dev/dsh-shuorenhua ~/.dsh/profiles/web/node_modules/dsh-shuorenhua
```

### 步骤 3：编写 cordis.patch.yml
在插件根目录下已有预置的 `cordis.patch.yml`：
```yaml
# cordis.patch.yml
- insert:
    - id: dsh-shuorenhua
      name: dsh-shuorenhua
      config:
        enableTool: true
```

### 步骤 4：一键启动 DSH Web 预览
在 `deepseek-harness` 仓库根目录下，带上 `--patch` 参数启动 DSH Web：
```bash
pnpm dsh web --patch /home/asdf/dev/dsh-shuorenhua/cordis.patch.yml
```

启动后在浏览器打开 DSH 页面（默认 `http://127.0.0.1:3080`），与 AI 进行任意对话。AI 回答完毕后，在气泡下方即可看到「💬 说人话」按钮，点击体验实时流式润色。

---

## 5. 经典踩坑点与排障实战指南 (FAQ)

### 坑点 1：`Error: cannot get property "xxx" without inject`
- **现象**：在插件执行过程中，代码尝试读取 `ctx.someService` 或 `(ctx as any).someService` 时，程序突然抛错中断。
- **根本原因**：Cordis 内部的 `ctx` 是由 `Proxy` 深度包裹的对象。当访问未在 `export const inject = [...]` 中声明的属性时，Proxy 的 `get` 拦截器会主动抛错以避免隐式依赖。
- **避坑法宝**：
  1. 插件必需的硬依赖，在 `export const inject` 中显式声明。
  2. 运行时可选探测的服务（如 `agentDefaultModel`），**绝不能直接访问属性**，务必使用 `ctx.get('someService')`。

### 坑点 2：前端报错 `Invalid hook call` 或 React Context 丢失
- **现象**：前端组件挂载后报 React Hooks 规则错误，或者无法获取到主题变量。
- **根本原因**：前端打包时没有将 `react` 与 `react-dom` 排除（external），导致插件自带了一份 React 代码，与主应用的 React 产生多实例冲突。
- **避坑法宝**：
  1. 前端构建配置的 `external` 中必须包含 `react` 和 `react-dom`。
  2. 必须包裹 `window.__ModuleLoader__.load({ id, factory: (require) => ... })`，通过主应用注入的 `require` 获取共享 React 实例。

### 坑点 3：JavaScript `replaceAll` 与 `$$` 字符转义陷阱
- **现象**：在对文本中的数学公式（如 `$$E=mc^2$$`）或者含 `$$` 的 Shell 变量进行占位还原时，还原出的内容莫名其妙少了一个 `$`。
- **根本原因**：原生 `string.replaceAll(pattern, replacement)` 当第二个参数为字符串时，`$$` 会被 JavaScript 原生解释为“插入单个 `$` 字符”。
- **避坑法宝**：所有字符串回填一律使用函数传参：
  ```ts
  // 错误：text.replaceAll(key, value)
  // 正确：
  text.replaceAll(key, () => value)
  ```

### 坑点 4：SSE 流式连接提前中断 (Client Request Aborted)
- **现象**：弹窗刚打开一瞬间报错 `AI 润色生成失败` 或 `返回内容为空`。
- **根本原因**：React 18 在 StrictMode 或依赖项重新计算时可能重复触发 `useEffect`，导致前一次的 `AbortController.abort()` 被调用，中断了正在握手的 SSE 连接。
- **避坑法宝**：在前端 `startHumanize` 中精准管理 `abortControllerRef`，并在后端对 `controller.signal.aborted` 做静默返回处理，区分真正的模型报错与正常的连接中断。

---

## 开源协议

本项目采用 [MIT License](LICENSE) 授权，欢迎自由交流、扩展与二次开发！
