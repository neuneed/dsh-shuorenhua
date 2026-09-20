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

## 二、DSH 插件原理（重点）

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

### 2.4 注册机制

在 DSH 开发中，服务依赖和注册分为三种截然不同的场景：

#### 1. 静态强依赖 (`export const inject = [...]`)
```ts
export const name = 'dsh-shuorenhua'
export const inject = ['llm'] // 没有 LLM，本插件毫无意义，必须等待它就绪
```
- **机制**：由 Cordis 在模块加载前分析。只有数组中所有服务都在上下文中挂载后，`apply` 才会触发。

#### 2. 动态条件注入 (`ctx.inject([...], callback)`)
```ts
// 当 webServer 存在时才挂载 HTTP 路由（在 Headless 纯命令行模式下没有 webServer，会自动跳过）
ctx.inject(['webServer'], (webCtx) => {
  webCtx.effect(() => registerShuorenhuaWebServer(webCtx, config))
})
```
- **机制**：当目标服务在运行时被激活时，回调函数才会执行，并且获得的 `webCtx` 作用域生命周期与该服务绑定。

#### 3. 运行时安全探测 (`ctx.get('serviceName')`)
```ts
// 为什么不能写: const model = ctx.agentDefaultModel?.currentSelection() ?
// 答：因为 ctx 是一个被 Proxy 代理的对象，直接访问未在 inject 中声明的属性会直接抛出：
// Error: cannot get property "agentDefaultModel" without inject

// 正确姿势：使用 ctx.get 安全探测
const defaultModelService = ctx.get('agentDefaultModel')
if (defaultModelService && typeof defaultModelService.currentSelection === 'function') {
  const selection = defaultModelService.currentSelection()
  // ...
}
```

**三者边界总结**：
- **静态 `inject`**：插件赖以生存的核心硬依赖（少而精）；
- **动态 `ctx.inject`**：平台相关的可选功能模块（如 WebServer、Tools）；
- **安全 `ctx.get`**：只读查询性质、随时可能存在或不存在的辅助状态。

---

### 2.5 通信机制

客户端与宿主端如何通信？本项目同时包含了官方推荐的两种模式：

#### 1. 同端口 WebServer SSE 流式路由（首选主通道）
- **官方依据**：DSH 源码中 `WebRoute.handler` 明确指出支持长连接流式响应（如 Server-Sent Events）。
- **同源无跨域**：直接借用 DSH 既有的 WebServer（默认端口 3080），无需另起一个 Express 服务或开放多余端口。
- **客户端断连安全处理**：
  ```ts
  const abortController = new AbortController()
  req.on('close', () => {
    // 用户在浏览器关闭弹窗或刷新页面时，立即中止宿主大模型生成，节省 Token！
    abortController.abort()
  })
  ```
- **流式帧协议**：
  ```http
  Content-Type: text/event-stream
  Cache-Control: no-cache

  data: {"delta":"说"}\n\n
  data: {"delta":"人"}\n\n
  data: {"delta":"话"}\n\n
  data: {"done":true}\n\n
  ```

#### 2. Typert RPC 通信（结构化回退通道）
- DSH 具备一套基于类型图的端到端 RPC 体系（Typert）。
- 本项目在宿主类 `ShuorenhuaRuntime` 中同样继承了 `TypertRemoteService` 并标记了 `@Remote humanize(text)`。当处于无流式长连接环境（如无网关长连接代理）时，可直接作为结构化单次调用的后备通路。

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
