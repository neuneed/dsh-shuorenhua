# dsh-shuorenhua 技术分享目录

> 本文档面向团队内部技术分享、新同学内训以及希望深入理解 DeepSeek Harness (DSH) 插件体系的开发者。
> 结合 `dsh-shuorenhua`（说人话插件）真实代码，系统剖析 DSH 全插件微内核、双端架构、生命周期、跨端通信、UI 插槽等核心机制。

---

## 〇、开场：先看效果

- **按钮长在哪**：在 DeepSeek 每轮助手 (Assistant) 回答下方的操作条中，优雅地嵌入在「复制 (Copy)」和「分支 (Branch)」按钮之间（`order: 12`）。
- **点了之后发生什么**：
  - 屏幕中央即刻弹出一个遵循 Apple 现代极简风格的毛玻璃浮层弹窗；
  - 弹窗内置**打字机实时流式输出**，无需等待整体生成完毕，逐字润色呈现；
  - 提供润色前后字数对比、精简比例统计；支持一键复制到剪贴板，按 `ESC` 键或点击遮罩随时秒退。
- **一句话定位**：把 AI 回答里充斥的空洞寒暄、公文八股、互联网黑话一键过滤掉，但**代码块、数学公式、专业术语一个字都不动**。
- **双模可用**：
  - **交互模式 (Web UI)**：最终用户在浏览器点击操作栏「💬 说人话」按钮；
  - **智能体模式 (Agent Tool)**：向 DSH 自主智能体注册 `shuorenhua_simplify` 工具，Agent 也可在思考链中按需调用。

---

## 一、这个插件长什么样

### 1.1 双端结构总览
DSH 的核心设计哲学之一是**双端同体（Host-Client Bifacial）**。一个完整的 DSH 插件不是两个割裂的仓库或进程，而是一个包内的两个对等运行面：

| 运行端 | 运行环境 | 核心职责 | 代表服务 |
| :--- | :--- | :--- | :--- |
| **Host 宿主端** | Node.js 进程 (ESM) | 掌控服务端微内核、管理生命周期、注入 Web 路由、调用大模型 `ctx.llm`、注册 Agent Tools | `ctx.llm`、`ctx.webServer`、`ctx.tools`、`ctx.typert` |
| **Client 浏览器端** | Web 单页 (Browser CJS) | 掌控前端 UI 交互、声明插槽注入、监听用户点击、消费 SSE 流式数据、渲染毛玻璃弹窗 | `ctx.slots`、`ctx.locale`、`useChat` 状态树 |

### 1.2 关键文件对照

```
[Host 宿主入口]   src/index.ts       ──> 控制插件生命周期、读取配置、按条件调度子模块
[Host 业务核心]   src/runtime.ts     ──> 调取 ctx.llm.stream、挂载 /shuorenhua/stream、注册 Agent 工具
[Client 前端入口] src/client/index.tsx──> 往 conversation.chat.assistant-actions 插槽注入按钮
```

### 1.3 一张图说清数据流

```
┌──────────────┐                 ┌───────────────┐                 ┌────────────────┐
│  Web Client  │                 │   Host 端     │                 │   DSH 宿主     │
│ (Shuorenhua) │                 │  (WebServer)  │                 │ (ctx.llm / AI) │
└──────┬───────┘                 └───────┬───────┘                 └───────┬────────┘
       │                                 │                                 │
       │ 1. 点击「💬 说人话」             │                                 │
       │────────────────────────────────>│                                 │
       │    POST /shuorenhua/stream      │                                 │
       │    { text: "AI 回答原内容" }     │                                 │
       │                                 │ 2. 注入润色 System Prompt       │
       │                                 │    调用 ctx.llm.stream(...)     │
       │                                 │────────────────────────────────>│
       │                                 │                                 │
       │                                 │ 3. 逐 Chunk 返回文本 Token       │
       │                                 │<────────────────────────────────│
       │ 4. SSE 流式帧 (实时打字机)       │                                 │
       │    data: {"delta":"..."}\n\n    │                                 │
       │<────────────────────────────────│                                 │
       │                                 │                                 │
       │ 5. SSE 结束帧                   │                                 │
       │    data: {"done":true}\n\n      │                                 │
       │<────────────────────────────────│                                 │
       │                                 │                                 │
       ▼                                 ▼                                 ▼
```

### 1.4 插件全貌：双端清单声明
在 `package.json` 中，通过专有的 `dsh` 字段，同时声明宿主端补丁与客户端注入规范：
```json
{
  "name": "dsh-shuorenhua",
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
        "@deepseek-ai/dsh-client-locale",
        "@deepseek-ai/dsh-client-ui-primitives"
      ]
    }
  }
}
```

---

## 二、DSH 插件原理

### 2.1 DSH 的插件介绍

DeepSeek Harness 是一个彻底的 **All-Plugin（全插件）微内核架构**，基于 Cordis 控制反转框架构建：
- **一切皆插件**：在 DSH 中，底层的模型调用提供方 (`llm`)、Agent 循环 (`agentLoop`)、文件系统 (`fs`)、工具注册表 (`tools`)、Web 服务器 (`webServer`)、前端插槽系统 (`slots`)，甚至 Web UI 自身，**全部都是平等挂载在 Cordis 树上的服务插件**。
- **没有特权核心**：不存在传统软件中高高在上且不可替换的“Core 霸权”。只要遵守服务接口规范，任何插件都可以被透明地替换、拦截或扩展。
- **双端对齐**：同一个插件包同时提供 Host 端的逻辑控制与 Client 端的页面渲染，两端生命周期与依赖关系对称统一。
- **拓扑依赖驱动**：插件不依赖手写的启动先后顺序，Cordis 会自动计算所有已注册插件的服务依赖图（Service Graph），进行拓扑排序并在依赖齐备时异步激活。

---

### 2.2 和普通插件的区别

| 维度 | VSCode 插件 | Chrome 扩展 | Webpack / Vite 插件 | Express / Koa 中间件 | **DSH 插件 (Cordis)** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **物理边界** | 独立 Extension Host 进程，跨进程序列化 IPC | Content Script + Background Service Worker 严格沙箱 | 纯构建编译期，不进入生产运行时 | 服务端单一线性调用链 | **双端同体**：后端直连 Node.js 宿主服务，前端直插单页 React 容器 |
| **时序控制** | 声明静态激活事件 `activationEvents` | 匹配 URL 模式注入 | 固定的构建生命周期 Tap 钩子 | `app.use()` 严格依赖代码编写顺序 | **服务拓扑依赖**：依赖的 Service 未就绪时自动处于挂起状态 |
| **UI 扩展** | 受限于 Webview/侧边栏，无法直接修改核心交互区 | DOM 暴力篡改，样式易被宿主页面污染破坏 | 无 UI 能力 | 无 UI 能力 | **声明式 Slots 插槽**：原生级嵌入交互流，精准排序，继承主题体系 |
| **生命周期** | 依赖窗口 Reload 或重启进程 | 刷新整个网页 | 触发文件热替换 | 无法安全热插拔 | **全生命周期可逆 Effect**：卸载插件时，路由、工具、按钮全部逆序自动拔除 |

---

### 2.3 DSH 插件的生命周期

在 DSH 内部，每个插件被包装为一个 **Fiber（纤程）** 状态机：

```
                满足 inject 依赖
   [ PENDING ] ─────────────────> [ ACTIVE ] ─── 卸载/依赖消失 ───> [ DISPOSED ]
        ▲                              │
        │                              │
        └─────── 依赖临时缺失 ─────────┘
```

1. **PENDING（挂起）**：插件已被载入，但声明在 `export const inject` 中的服务（如 `llm`）尚未在全局上下文中发布，插件的 `apply` 函数**绝不会被调用**。
2. **ACTIVE（激活）**：所有声明的依赖就绪，Cordis 激活 Fiber，执行 `apply(ctx, config)`。
3. **DISPOSED（注销）**：插件被显式禁用，或上游某个依赖服务被卸载。此时 Cordis 将**逆序执行所有在该 Context 上注册的 Disposer（清理函数）**。

#### 核心铁律：所有注册必须通过 `ctx.effect`
```ts
// 错误做法：直接在 apply 中执行不可逆注册（卸载时会泄漏！）
webServer.register({ path: '/foo', handler }) 

// 正确做法：通过 ctx.effect 包装，返回 Disposer
ctx.effect(() => {
  const dispose = webServer.register({ path: '/shuorenhua/stream', handler })
  return () => {
    // 当插件被卸载时，自动拔除路由，绝不污染宿主！
    dispose()
  }
}, 'shuorenhua: webserver route')
```

---

### 2.4 注册机制（深层剖析）

在 DSH / Cordis 的架构哲学中，**“一切依赖显式声明，一切注册皆为可逆 Effect”**。
很多初学者常困惑：为什么有的写在 `inject` 里，有的写在 `ctx.inject` 里，有的用 `ctx.get`，有的要 `ctx.effect`，到底什么时候用哪个？哪种才是最常用的？

下面从**依赖消费**、**能力提供**、**资产注册**三个维度系统拆解，并标注使用频次与官方依据。

#### 维度一：服务依赖与消费的 3 种姿势（重点）

| 模式 | 常用指数 | 适用场景 | 缺失时的行为 | 官方设计意图 |
| :--- | :--- | :--- | :--- | :--- |
| **① 静态强依赖 (`export const inject`)** | **⭐⭐⭐⭐⭐ (最常用·黄金标准)** | 插件核心功能依赖的基础服务（如 `llm`、`slots`、`locale`） | 插件保持 `PENDING`，`apply` 绝不执行 | **零竞态**：代码执行时 100% 保证服务存在，无需任何判空；依赖重载时自动级联重载 |
| **② 动态条件注入 (`ctx.inject`)** | **⭐⭐⭐⭐ (环境适配首选)** | 跨运行模式的可选功能（如 `webServer` 只在 Web 下有，Headless 下没有） | 暂不执行回调，一旦服务就绪立即触发 | **多模自适应**：让同一个插件能无缝兼容 Web、CLI、Headless 多种 profile |
| **③ 运行时只读安全探测 (`ctx.get`)** | **⭐⭐ (防御性辅助)** | 只读探测辅助配置或状态（如 `agentDefaultModel` 探测当前选中模型） | 返回 `undefined`，插件继续正常跑 | **安全防爆**：绕过 Cordis 的 Proxy 报错拦截，安全读取动态状态 |

---

##### 1. 【最常用 ⭐⭐⭐⭐⭐】静态强依赖声明 (`export const inject = [...]`)
这是 DSH 插件开发中 **90% 场景下的首选**。
- **代码范例**（本项目 `src/index.ts` / `src/client/index.tsx`）：
  ```ts
  export const name = 'dsh-shuorenhua'
  // 静态强依赖：声明插件启动的必要条件
  export const inject = ['llm']

  export function apply(ctx: Context) {
    // 此时 ctx.llm 100% 就绪且类型安全，无需任何判空！
    console.log('LLM service ready:', ctx.llm)
  }
  ```
- **工作机制（官方规范）**：
  1. Cordis 在加载插件模块前，首先静态读取导出的 `inject` 数组；
  2. 如果数组中有任何一个服务未就绪，Fiber 状态保持为 `PENDING`，`apply` 压根不会被调用；
  3. **级联重载与依赖跟踪**：当运行时某个依赖服务被热更新或卸载时，Cordis 会自动将该消费插件注销（Dispose），直到新依赖提供后再自动重新激活（Re-apply）。彻底杜绝了悬空引用与内存泄漏。

---

##### 2. 【次常用 ⭐⭐⭐⭐】动态条件注入 (`ctx.inject([...], callback)`)
用于**平台/环境解耦**。如果某个功能只有在特定环境（如 Web 模式）下才启用，绝不能放进静态 `inject`，必须使用动态条件注入。
- **代码范例**（本项目 `src/index.ts`）：
  ```ts
  // WebServer 仅在 Web profile 下存在；在 Headless 命令行下不存在
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => {
      // 仅在 webServer 激活后才挂载路由
      return registerShuorenhuaWebServer(webCtx, resolved)
    }, 'dsh-shuorenhua: webserver route')
  })
  ```
- **工作机制**：
  - 当目标服务激活时，回调函数被调用，传入具有该服务作用域的 `webCtx`；
  - 如果应用在纯命令行模式（如 `pnpm dsh --profile headless`）运行，`webServer` 不存在，回调静默不执行，**但插件主体（如 Agent 工具）依然能正常工作**！
  - **避坑红线**：千万不能把环境专有服务（如 `webServer`）写进静态 `export const inject`，否则会导致插件在命令行模式下永久处于 `PENDING` 假死状态！

---

##### 3. 【防御性常用 ⭐⭐】运行时安全探测 (`ctx.get('serviceName')`)
用于**偶发性、只读性状态探测**。
- **代码范例**（本项目 `src/runtime.ts`）：
  ```ts
  // 正确：使用 ctx.get 探测当前选中的默认模型服务
  const defaultModelService = ctx.get('agentDefaultModel')
  if (defaultModelService && typeof defaultModelService.currentSelection === 'function') {
    const selection = defaultModelService.currentSelection()
    // 探测到了用户在界面上选中的主模型...
  }
  ```
- **深入底层：为什么不能直接写 `ctx.agentDefaultModel`？**
  - Cordis 的上下文 `ctx` 底层是一个被深度 `Proxy` 拦截的对象；
  - 如果一个插件**没有在 `inject` 里声明**该服务，直接通过属性点语法 `ctx.someService` 访问时，Proxy 的 `get` 陷阱（Trap）会主动抛出致命异常：
    `Error: cannot get property "xxx" without inject`
  - 这种设计的官方意图是：**强制杜绝隐式依赖**。要安全地进行可选探测，必须通过专门开放的 `ctx.get('xxx')` API，它在服务不存在时会安全返回 `undefined`，而绝不抛错。

---

#### 维度二：提供新服务的注册机制 (Service Provision)

如果你的插件本身要向 DSH 全局上下文贡献一个**全新的服务能力**（如扩展文件提供方、会话存储提供方、或者像本项目一样提供 `shuorenhua` 服务）：

```ts
import { Service, type Context } from '@deepseek-ai/cordis'

// 1. TypeScript 声明合并（编译期类型安全）
declare module '@deepseek-ai/cordis' {
  interface Context {
    shuorenhua: ShuorenhuaService
  }
}

// 2. 继承 Service（运行时服务注册）
export class ShuorenhuaService extends Service {
  constructor(ctx: Context) {
    // 关键调用：super(ctx, '服务名称') 会自动将本实例挂载到 ctx.shuorenhua
    super(ctx, 'shuorenhua')
  }

  // 暴露公共能力方法
  simplify(text: string): string {
    return text.trim()
  }
}

// 3. 在插件入口中挂载
export function apply(ctx: Context) {
  ctx.plugin(ShuorenhuaService) // 挂载为子插件
}
```
- **机制**：`super(ctx, 'key')` 内部会自动向 Cordis 注册此服务。当该插件卸载时，服务会自动从全局上下文中拔除，依赖该服务的下游插件随之被自动注销。

---

#### 维度三：具体能力与资产的注册范式 (Asset Registration)

在拿到具体服务后，向服务注册工具、路由、插槽或事件，必须严格遵守 **“注册是可逆 Effect（Disposer 模式）”**。

| 资产类别 | 注册方法 | 对应服务 | 是否自动返回 Disposer | 代码范例 |
| :--- | :--- | :--- | :--- | :--- |
| **大模型工具** | `ctx.tools.register(...)` | `ctx.tools` | 是 | `tools.register(defineTool({ name, execute }))` |
| **HTTP 路由** | `ctx.webServer.register(...)` | `ctx.webServer` | 是 | `webServer.register({ path, handler })` |
| **前端插槽** | `ctx.slots.inject(...)` + `register` | `ctx.slots` | 是 | `slots.inject(name, () => slots.register(...))` |
| **国际化词典** | `ctx.locale.define(...)` | `ctx.locale` | 是 | `locale.define('zh', dictionary)` |
| **事件监听** | `ctx.on(event, listener)` | `ctx.events` | 是 | `ctx.on('tools/result', callback)` |
| **洋葱圈中间件** | `ctx.waterfall(event, listener)` | `ctx.events` | 是 | `ctx.waterfall('llm/stream', (opts, next) => next())` |

##### 核心铁律：所有不可自动回收的注册必须包裹在 `ctx.effect` 中
DSH 架构规则明确规定：*“Registrations are effects: every contribution goes through ctx.effect() / ctx.on(); a registry's register() returns the disposer.”*
- 如果你调用的 API 返回了 `disposer`（如路由注册、定时器、事件监听器），务必在 `ctx.effect` 的清理回调中调用它：
  ```ts
  ctx.effect(() => {
    const unregister = webServer.register({ path: '/shuorenhua/stream', handler })
    return () => {
      // 插件被卸载或 HMR 重载时，Cordis 逆序执行此 Disposer
      unregister()
    }
  }, 'shuorenhua: webserver route')
  ```

---

#### 💡 注册决策树速查

当你写代码需要用到某个 DSH 能力或注册资产时，按以下决策树秒选：

```
需要使用某个服务能力？
  ├─ 核心功能强依赖，缺了插件就不能跑？
  │    └──> 【首选 ⭐⭐⭐⭐⭐】写入 `export const inject = ['xxx']`
  ├─ 仅在特定环境（如 Web）下才启用的附加功能？
  │    └──> 【次选 ⭐⭐⭐⭐】使用 `ctx.inject(['xxx'], (ctx) => { ... })`
  └─ 只是临时只读探测一个辅助状态，不存在也不影响主流程？
       └──> 【探测 ⭐⭐】使用 `ctx.get('xxx')`

向系统注册资产（路由 / 工具 / 监听器 / 计时器）？
  └─ 必须包裹在 `ctx.effect(() => { ... return () => dispose() })` 中，
     确保热重载与卸载时 100% 自动清理无残留！
```

---

### 2.5 通信机制（深层剖析）

在 DSH 的双端架构中，Host 宿主端（Node.js）与 Client 浏览器端（Web）运行在不同的物理上下文中。如何高效、稳定、无额外负担地进行跨端数据通信？

DSH 官方提供了两种核心跨端通信通道，外加一种进程内事件机制。下面系统拆解它们的原理、官方依据、适用场景与使用频次。

#### 维度一：通信模式全景对比

| 模式 | 常用指数 | 核心协议 | 适用场景 | 官方依据与设计意图 |
| :--- | :--- | :--- | :--- | :--- |
| **① 同端口 WebServer SSE 流** | **⭐⭐⭐⭐⭐ (流式业务·最常用)** | HTTP / SSE (`text/event-stream`) | AI 生成打字机输出、实时长任务推送、增量文本流 | **官方原生支持长连接**：`WebRoute.handler` 明确允许持有连接生命周期；同源同端口（3080），零跨域，浏览器原生 `fetch` 极简消费 |
| **② Typert API Gateway RPC** | **⭐⭐⭐⭐ (系统级交互·标准范式)** | HTTP `/api` + 强类型 JSON Envelope | 状态查询、配置写入、会话管理、一问一答一元调用 | **端到端类型图契约**：基于 `@Remote` 装饰器与编译期 Schema，提供无 Proxy 的具体类型安全 RPC，由 Connection 统一鉴权与路由 |
| **③ 进程内 Cordis 事件总线** | **⭐⭐⭐⭐⭐ (进程内通信·黄金标准)** | 内存级 EventEmitter / Waterfall | 插件与插件间解耦通信、流水线拦截、生命周期感知 | **解耦与中间件**：提供 `emit`、`waterfall`、`parallel`、`serial`、`bail` 五种分发模式，支持洋葱圈委托 |

---

#### 1. 【流式交互最常用 ⭐⭐⭐⭐⭐】同端口 WebServer SSE 流式路由
在 AI 对话与大白话润色场景中，**流式打字机体验是绝对的刚需**。用户无法容忍一段 500 字的文本等待十几秒后一次性跳出。

##### 官方依据与底层原理
查阅 DSH 官方 WebServer 文档（[`docs/subsystems/web-server.zh.md`](file:///home/asdf/dev/deepseek-harness/docs/subsystems/web-server.zh.md)）及源码：
```ts
interface WebRoute {
  kind: 'exact' | 'prefix'
  path: string
  /** Owns the full response lifecycle (may hold the response open, e.g. SSE). */
  handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
}
```
- **官方专门标注**：`handler` 拥有完整的响应生命周期，**明确支持保持连接打开（例如 SSE）**；
- **同源复用 3080**：WebServer 默认监听 `127.0.0.1:3080`。插件注册的路由直接挂载在当前 Web 服务的路径树下（如 `/shuorenhua/stream`），与前端 SPA 页面完全同源，**彻底消灭了 CORS 跨域限制与端口冲突**。

##### 宿主端关键实现（带客户端断连中止）
```ts
// src/runtime.ts
export function registerShuorenhuaWebServer(ctx: Context, config: ShuorenhuaConfig = {}) {
  const webServer = ctx.get('webServer')
  if (!webServer) return () => {}

  return webServer.register({
    kind: 'exact',
    path: '/shuorenhua/stream',
    handler: async (req, res) => {
      // 1. 建立 SSE 标准响应头
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.setHeader('Connection', 'keep-alive')
      res.flushHeaders?.()

      // 2. 核心精髓：监听客户端连接断开，联动中止底层大模型
      const controller = new AbortController()
      req.on('close', () => {
        // 用户关闭弹窗、按 ESC 或切换页面时，立即中止宿主 LLM 生成，节省 Token！
        controller.abort()
      })

      // 3. 消费 Host 端 ctx.llm 流并实时向浏览器推帧
      try {
        for await (const chunk of streamHumanize(ctx, text, config, controller.signal)) {
          res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`)
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      } catch (err: any) {
        if (!controller.signal.aborted) {
          res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
        }
      } finally {
        res.end()
      }
    },
  })
}
```

##### 浏览器端原生流式消费
前端不需要安装复杂的第三方库，直接使用标准浏览器原生能力消费 SSE：
```tsx
// src/client/components/ShuorenhuaModal.tsx
const response = await fetch('/shuorenhua/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text }),
  signal: abortController.signal,
})

const reader = response.body.getReader()
const decoder = new TextDecoder('utf-8')
let buffer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split('\n\n')
  buffer = lines.pop() || ''

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue
    const payload = JSON.parse(line.slice(6))
    if (payload.delta) {
      setStreamedText(prev => prev + payload.delta) // 逐字呈现打字机效果！
    }
  }
}
```

---

#### 2. 【系统级交互标准 ⭐⭐⭐⭐】Typert API Gateway RPC
DSH 内置了一套极具特色的端到端类型化 RPC 框架——**Typert**。

##### 核心架构与运行机制
查阅官方参考文档（[`docs/api-gateway.zh.md`](file:///home/asdf/dev/deepseek-harness/docs/api-gateway.zh.md)）：
- **定义端**：宿主服务继承 `TypertRemoteService`，使用 `@Remote` 装饰器标记对 Client 导出的方法；
- **通信通道**：底座 Connection 服务开辟统一的 `/api/<namespace>/<method>` 通信桥（基于 HTTP POST JSON），传递具名 `args` 字典，并负责会话校验与鉴权；
- **客户端调用**：Client 挂载贡献后，直接以强类型方式发起调用：`await ctx.remote.shuorenhua.humanize(text)`。

##### 本项目的双轨实践：作为结构化回退通路
虽然前端打字机弹窗由于极速流式需求优先采用了 SSE，但在宿主层，本项目**依然完整实现了 Typert RPC 服务**（见 `src/runtime.ts`）：
```ts
export class ShuorenhuaRuntime extends TypertRemoteService {
  constructor(ctx: Context, private readonly config: ShuorenhuaConfig = {}) {
    super(ctx, 'shuorenhua')
  }

  @Remote
  async humanize(text: string): Promise<HumanizeResult> {
    // 聚合整段文本，返回结构化统计数据（字数、精简率等）
    let assembled = ''
    for await (const delta of streamHumanize(this.ctx, text, this.config)) {
      assembled += delta
    }
    return {
      text: assembled,
      original: text,
      stats: { originalLength: text.length, humanizedLength: assembled.length /* ... */ }
    }
  }
}
```
- **价值**：当处于不支持长连接的代理环境、或者其他第三方插件想要通过代码直调“说人话”能力时，Typert RPC 提供了坚固可靠的结构化调用通路。

---

#### 3. 【进程内通信黄金标准 ⭐⭐⭐⭐⭐】Cordis 事件与洋葱圈机制
如果通信发生在同一进程的插件之间（例如在 Host 内部观察工具结果，或拦截大模型提示词）：

##### 普通广播事件 (`ctx.on`)
```ts
// 监听工具执行结果事件
ctx.on('tools/result', (exec, result) => {
  console.log(`[工具调用] ${exec.name} 完成`)
})
```

##### 瀑布流拦截中间件 (`ctx.waterfall`)
DSH 的大模型流和流水线常使用 `waterfall`。官方规则严格要求：**监听器必须调用 `next()` 委托给下游，否则将短路中断链路**：
```ts
ctx.waterfall('llm/stream', (options, next) => {
  // 在送入大模型前篡改或追加 prompt
  options.system = (options.system || '') + '\n追加自定义规则'
  return next() // 必须显式委托！
})
```

---

#### 💡 通信方案选型决策树

```
两端之间需要传递什么数据？
  ├─ 实时文字生成、逐字打字机、高频大文本流式？
  │    └──> 【首选 ⭐⭐⭐⭐⭐】WebServer SSE（同端口 3080，原生 fetch 消费，带断连中止）
  ├─ 一问一答、状态查询、配置写入、结构化表单？
  │    └──> 【首选 ⭐⭐⭐⭐】Typert RPC（走 /api，强类型契约，自带鉴权与生命周期）
  └─ 同一进程内的插件解耦通知或请求拦截？
       ├── 普通观察通知 ──> 【首选 ⭐⭐⭐⭐⭐】`ctx.on('event', callback)`
       └── 中间件环绕拦截 ─> 【首选 ⭐⭐⭐⭐⭐】`ctx.waterfall('event', (args, next) => next())`
```

---

### 2.6 插槽机制

#### 1. `conversation.chat.assistant-actions`
DSH Web 客户端在聊天气泡的操作栏预留了专有插槽。每个回答生成后，插槽系统会按 `order` 顺序渲染所有注入的按钮。

#### 2. 两步注入流程
在 `src/client/index.tsx` 中：
```tsx
export function apply(ctx: ClientContext): void {
  // 第一步：声明注入到目标插槽
  ctx.slots.inject('conversation.chat.assistant-actions', () =>
    // 第二步：注册具体的按钮组件，并通过 order 精确排位
    ctx.slots.register(
      {
        name: 'conversation.chat.assistant-actions',
        id: 'dsh-shuorenhua-action',
        order: 12, // DSH 默认复制按钮为 10，分支按钮为 20。设为 12 精准排在二者之间！
      },
      ShuorenhuaButton,
    ),
  )
}
```

#### 3. 响应式获取消息上下文
插槽组件会自动接收 DSH 传递的 props（包含当前消息的 `messageId`）。结合主应用的 `useChat` 状态钩子，即可在用户点击按钮的一瞬间，从当前响应式会话树中取得完整的原始文本：
```tsx
export function ShuorenhuaButton({ messageId }: { messageId?: string }) {
  const chat = useChat?.()
  const currentTurn = chat?.messages?.find((m: any) => m.id === messageId)
  const originalText = currentTurn?.content || ''
  // ...
}
```

---

### 2.7 如何开发一个插件

从零开发一个 DSH 插件的标准 4 步走：

1. **第一步：配置 `package.json`**：声明 `dsh.bundle.patch` 与 `dsh.client`，指定宿主入口和前端微模块注入配置。
2. **第二步：编写 Host 入口 `src/index.ts`**：
   - 导出 `name` 与必需的 `inject`；
   - 在 `apply(ctx)` 中通过 `ctx.effect` 与 `ctx.inject(['webServer'])` 进行有保障的资源挂载。
3. **第三步：编写 Client 入口 `src/client/index.tsx`**：
   - 注入 UI 插槽（如 `assistant-actions`）；
   - 挂载国际化词条到 `ctx.locale`。
4. **第四步：配置双端构建脚本 `build.mjs`**：
   - Host 端打包为 Node22 ESM（排除 `@deepseek-ai/*`）；
   - Client 端打包为 Browser CJS，并在顶部包裹 `window.__ModuleLoader__.load(...)` banner。

---

## 三、项目工程目录全景

```
dsh-shuorenhua/
├── package.json             # 插件清单，声明 dsh.bundle 与 dsh.client
├── cordis.patch.yml         # 注入到 DSH 运行时的编排补丁
├── dsh.plugin.json          # 插件对外贡献的 Tool/Skill 清单声明
├── build.mjs                # 双端打包管线 (Host ESM + Browser CJS)
├── tsconfig.json            # 源码 TypeScript 配置
├── tsconfig.build.json      # 类型声明分发配置
├── vitest.config.ts         # 单元测试配置
├── src/
│   ├── types.ts             # 核心类型契约定义
│   ├── typert.ts            # Typert RPC 契约清单
│   ├── index.ts             # 【Host 入口】生命周期控制与服务条件挂载
│   ├── runtime.ts           # 【Host 核心】调 ctx.llm、注册 SSE 路由、注册 Agent 工具
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
│           └── ShuorenhuaModal.tsx  # 流式打字机弹窗组件
└── tests/                   # 自动化单元测试集 (Vitest)
    ├── placeholders.spec.ts # 占位符保真测试
    ├── rules.spec.ts        # 正则过滤规则测试
    ├── humanizer.spec.ts    # 多模式文本润色测试
    └── runtime.spec.ts      # Host 端 RPC 服务与 LLM 流式测试
```

**每个目录/文件的职责一句话说明：**

| 文件/目录 | 作用 |
|---|---|
| `package.json` | 声明 `dsh.bundle` 和 `dsh.client`，告诉 DSH 怎么加载这个插件 |
| `cordis.patch.yml` | 把插件注入 DSH 运行时的编排补丁，启动时通过 `--patch` 挂载 |
| `dsh.plugin.json` | 对外声明本插件贡献了哪些 Tool 和 Skill |
| `build.mjs` | 双端构建脚本，Host 出 ESM，Client 出 CJS + ModuleLoader 包裹 |
| `src/index.ts` | Host 入口，`apply` 函数里做生命周期控制和条件挂载 |
| `src/runtime.ts` | Host 核心逻辑：调 LLM 流式生成、注册 SSE 路由、注册 Agent 工具 |
| `src/engine/` | 双端共用的去八股算法库，不依赖任何 DSH 服务，可独立测试 |
| `src/client/index.tsx` | Client 入口，往 `assistant-actions` 插槽注入按钮 |
| `src/client/components/` | 按钮组件和弹窗组件，纯 React 实现 |
| `src/client/locales.ts` | 中英文案字典，注册到 `ctx.locale` |
| `tests/` | Vitest 单元测试，覆盖占位符、规则、清洗引擎、Host 运行时 |

---

## 四、插件技术细节（重点）

### 4.1 弹窗交互

弹窗位于 `src/client/components/ShuorenhuaModal.tsx`，包含了极致的用户体验细节设计：

1. **React Portal 挂载到 Body**：
   - 弹窗不挂在聊天流局部节点下，而是通过 `createPortal(jsx, document.body)` 挂载到顶层，彻底杜绝父容器 `overflow: hidden` 截断或 CSS transform 对定位的影响。
2. **全局 ESC 快捷退出**：
   ```tsx
   useEffect(() => {
     if (!open) return
     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'Escape') {
         e.stopPropagation() // 阻止冒泡，防止误关上层全屏容器
         onClose()
       }
     }
     window.addEventListener('keydown', handleKeyDown)
     return () => window.removeEventListener('keydown', handleKeyDown)
   }, [open, onClose])
   ```
3. **点击遮罩外沿秒退**：
   ```tsx
   <div className="srh-mask" onClick={(e) => {
     if (e.target === e.currentTarget) onClose()
   }}>
   ```
4. **高质量剪贴板写入与降级**：
   - 优先调用现代浏览器标准的 `navigator.clipboard.writeText(text)`；
   - 在非 HTTPS 或限制性环境下自动降级为 `document.execCommand('copy')`；
   - 复制成功后呈现 2 秒动画反馈（「✓ 已复制」）。

---

### 4.2 同端口 SSE 流式处理

流式生成全过程完全复用了宿主已有的 WebServer：

1. **注册路由**：
   在 `src/runtime.ts` 中通过 `webServer.register` 注册：
   ```ts
   webServer.register({
     kind: 'exact',
     path: '/shuorenhua/stream',
     handler: async (req, res) => {
       // 设置 SSE 专有响应头
       res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
       res.setHeader('Cache-Control', 'no-cache, no-transform')
       res.setHeader('Connection', 'keep-alive')
       res.flushHeaders?.()

       // 客户端断开长连接时中止 LLM
       const controller = new AbortController()
       req.on('close', () => controller.abort())

       try {
         for await (const chunk of streamHumanize(ctx, text, config, controller.signal)) {
           res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`)
         }
         res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
       } catch (err: any) {
         res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
       } finally {
         res.end()
       }
     },
   })
   ```
2. **前端消费**：
   前端通过原生 `fetch('/shuorenhua/stream')` 拿到 `ReadableStream`，经 `TextDecoder` 解码按 `\n\n` 分帧解析，实现无需引入额外第三方库的高性能打字机渲染。

---

## 五、这个插件的优点

| 优势 | 为什么重要 |
| :--- | :--- |
| **热插拔无残留** | 路由、工具、按钮全部走 `ctx.effect` 托管，插件卸载时立即干干净净还原 |
| **双端同体** | 一个单体代码仓库，同时覆盖 Host 服务端和 Client 浏览器，研发与发布高度一致 |
| **极速流式体验** | 打字机流式输出，打开弹窗即刻开始逐字润色，免去漫长等待整段生成的焦虑 |
| **代码绝对保真** | 占位符技术在文本进入正则和大模型前精准保护代码块、公式与链接，零篡改、零误伤 |
| **多通路降级可用**| 主推同源 SSE 打字机流式；在长连接受限环境下保留了 Typert 强类型 RPC 作为坚固底牌 |
| **双模能力暴露** | 既有人机交互的 Web 按钮弹窗，也向自主决策的 Agent 暴露了标准大模型 Tool |
| **零额外网络端口**| 深度复用 DSH 现成的 3080 端口，生产与开发环境无需开放任何防火墙端口 |

---

## 六、坑点速查

### 1. `cannot get property "xxx" without inject`
- **原因**：访问了未在 `export const inject` 中声明的宿主服务，触发了 Cordis Context 的 `Proxy` 陷阱。
- **解法**：硬依赖显式放入 `inject` 数组；运行时可选探测服务（如 `agentDefaultModel`）一律使用 `ctx.get('xxx')`。

### 2. `Invalid hook call` / React Context 丢失
- **原因**：打包前端产物时将 `react` 打进了自身 bundle，与主应用产生多实例冲突。
- **解法**：`build.mjs` 中的 `external` 必须严格包含 `react` 和 `react-dom`，并使用 `window.__ModuleLoader__` 的共享 `require`。

### 3. `$$` 公式字符被吞
- **原因**：JavaScript 原生 `string.replaceAll(pattern, replacement)` 当第二个参数传字符串时，`$$` 会被转义为单个 `$`。
- **解法**：字符串回填占位符时，第二参数一律传函数：`str.replaceAll(key, () => value)`。

### 4. Effect 资源泄漏
- **原因**：在插件中注册了事件、定时器或路由，但未返回清理函数。
- **解法**：所有可逆副作用必须在 `ctx.effect(() => { ... return () => dispose() })` 中完成。

### 5. 可选服务放进静态 `inject` 导致插件永久假死
- **原因**：如果把仅在 Web 模式下存在的 `webServer` 写进了静态的 `export const inject = ['llm', 'webServer']`，当在 Headless 命令行下启动时，插件将因 `webServer` 永远不存在而一直处于 `PENDING` 挂起状态。
- **解法**：动态/可选服务必须使用 `ctx.inject(['webServer'], (ctx) => { ... })`。

---

## 七、参考资料

- **DSH 官方子系统文档**：
  - WebServer 服务规范：`docs/subsystems/web-server.md`
  - API Gateway 与 RPC：`docs/api-gateway.md`
  - Typert 远程类型系统：`docs/subsystems/typert.md`
- **DSH 模型提供方开发**：
  - LLM Provider 接入指南：`docs/user/develop/practice/llm-adapter.md`
- **本项目完整源码**：
  - 宿主与算法逻辑：`src/index.ts`、`src/runtime.ts`、`src/engine/`
  - 前端组件与样式：`src/client/`
