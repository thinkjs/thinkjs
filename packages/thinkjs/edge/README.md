# ThinkJS Edge（实验性入口）

源码基线：`thinkjs/thinkjs@aa9cdde600db87c332e5c98f704024e1a66788f4`。

Node.js 和 Edge 共用 `lib/application.js` 中的 Application。`run()` 首先检查 `_isRunInEdge()`：`runtime: 'edge'` 返回 Fetch 处理器，其余情况继续原有 Node.js 启动流程。`thinkjs/edge` 只是同一个 Application 的 Web 入口，并提供兼容用的 `createApp()` 简写。Node.js 应用继续使用原来的 `require('thinkjs')`。

共享范围包括 `think` 对象与基类、Service 查询、启动钩子、数据与扩展注册、中间件配置解析、路由、Logic/Controller 分发、校验以及 Context 的参数和业务响应方法。Edge 只负责静态清单加载和 Web Request/Response、Cookie、请求体等传输适配；不维护框架逻辑的生成副本。

## 构建与运行

在仓库根目录执行：

```sh
pnpm install --frozen-lockfile
node packages/thinkjs/edge/build.js packages/thinkjs/examples/edge/src packages/thinkjs/examples/edge/dist/worker.js
```

在安装 ThinkJS 的项目中可以通过 API 构建：

```js
import {buildEdge} from 'thinkjs/edge/build';

await buildEdge({
  appPath: './src',
  outfile: './dist/worker.mjs',
  env: 'production',
  options: {bodyLimit: 1024 * 1024}
});
```

构建在 Node.js 中扫描文件，不执行应用配置或启动模块。业务配置在运行时求值，平台密钥通过请求的 `ctx.env` 注入；不要在源码配置中硬编码密钥。支持 JS、TS、可静态分析的 CommonJS；动态 require、Node.js 内置依赖和动态代码执行会被拒绝。TypeScript 构建只转译，不代替类型检查。

输出为独立 ESM，默认导出 `{fetch(request, env, context)}`。Cloudflare Workers 可直接使用示例中的 `wrangler.jsonc`，无须 `nodejs_compat`。Deno 包装入口：

```js
import app from './dist/worker.mjs';

Deno.serve((request) => app.fetch(request, {NAME: 'Deno'}));
```

也可手工提供静态清单：

```js
import Application, {Controller} from 'thinkjs/edge';

class Index extends Controller {
  indexAction() {
    return this.success({name: this.ctx.env.NAME});
  }
}

const application = new Application({
  runtime: 'edge',
  manifest: {controllers: {index: Index}}
});
const app = application.run();
export default {
  fetch(request, env, context) {
    return app.fetch(request, env, context);
  }
};
```

## 生命周期与迁移

- 每个运行环境只允许创建一个应用。全局 `think` 在业务模块求值前安装，支持现有 `extends think.Controller` 写法；不要在全局对象、Service 单例或配置中存储请求状态。
- 首次请求共享初始化 Promise；`bootstrap/worker.js` 在请求处理前加载，其函数导出会被调用。支持 `think.beforeStartServer` 和 `appReady`，初始化失败或超时后持续返回 500，不执行 Controller。master 启动脚本不运行。
- 自动识别单模块和 `common/config` 多模块布局；公共 Controller/Logic/Service 被模块覆盖，嵌套控制器优先匹配。配置顺序为默认值、common、module、common 环境配置、module 环境配置。
- 默认链为 router → logic → controller。`config/middleware` 可设置直接中间件或 factory 描述符，支持 `enable`、`match`、`ignore`、异步 options。payload、trace、meta 的无选项占位项由 Fetch 固有请求准备与错误处理承担，旧选项不兼容；resource 等 Node.js 中间件明确报错。
- `ctx.webRequest` 是原始 Request；默认请求准备会消费它的 body。解析后使用 `post()`、`file()`、`ctx.request.rawBody`，不要再次读取 Request body。默认最大 1 MiB，按实际读取字节限制，格式错误返回 400，超限返回 413。
- 上传对象是 Web File，使用 `arrayBuffer()`、`text()` 或 `stream()`；没有 `path` 或临时磁盘文件。重复上传字段返回 File 数组。
- Cookie 使用 Keygrip 兼容的 HMAC-SHA1 签名格式。`config.cookie.keys` 配置主密钥和旧密钥，读取时验证并轮换，响应收尾生成签名；请求中临时更换 keys 不受支持。当前 Cookie 配置采用 common 配置，模块级单独密钥不支持。
- 请求环境绑定保存在 `ctx.env`。`ctx.waitUntil(promise)` 转交平台上下文，不支持时明确报错。代理头默认不受信任；需要客户端 IP 时，在手工入口的 Application options 中提供平台可信的 `clientIP(request, env)`。
- 框架错误通过 `options.logger.error` 记录，500 响应不暴露内部错误。Web 流直接交给运行时传输，取消传递给原始流；开始传输后的流错误由运行时终止连接。

## 能力范围

| 能力 | 首版状态 |
| --- | --- |
| 默认/自定义路由、多模块、Logic 校验、Controller hooks | 支持，复用既有分发与校验实现 |
| JSON、普通表单、文本、multipart、Cookie | 支持；文本在 `post('text')` |
| Web ReadableStream、HEAD、204/205/304 | 支持 |
| context / controller / logic / service 扩展 | 支持 |
| Koa req/res/socket、request/response 扩展、Node.js 流 | 不支持，迁移为 Web API/context 扩展 |
| 文件下载路径、文件日志、cache/session/model、模板 | 不内置，使用边缘兼容 Service 或显式扩展 |
| adapter/crontab 配置、进程管理、WebSocket | 不支持；adapter/crontab 配置在构建时拒绝 |
| 其他 Fetch 平台 | 提供通用入口，未经测试的平台不标记已支持 |

## 验证与维护

```sh
pnpm --dir packages/thinkjs run lint:edge
pnpm --dir packages/thinkjs run test:edge
pnpm test
```

跨运行时测试使用同一 HTTP 契约验证 Node Fetch、Deno 和 Miniflare/workerd（无 Node 兼容模式），不部署线上资源。首次测试需要安装对应平台二进制，并允许本地端口监听。

运行时直接引用现有包和共享核心源码，普通应用构建时统一打包。`think-helper/pure` 是纯工具入口，`think-loader/middleware` 与 `think-loader/extend` 是现有加载器的可移植部分。Node.js 的目录扫描、Koa、cluster 与 HTTP 服务保留在 Node 分支；浏览器构建通过包的条件导入排除 Node 启动模块。

此修改涉及多个工作区包，发布时必须同步发布含新增入口的 think-helper、think-loader 及其消费者，并更新消费者最低依赖版本；本 PR 不执行版本发布。

本入口为可测试的初版，第三方 Koa/ThinkJS 插件需要逐个检查，不能把现有 Node.js 插件生态的兼容性推定为边缘兼容性。尚未发布 npm 或部署到线上。

### 验证记录

旧实现的验证记录已由架构调整后的回归测试替代。CI 在 Node.js 24 上执行边缘用例，同一 HTTP 契约覆盖 Node Fetch、Deno 与未开启 Node 兼容模式的 Miniflare/workerd。新增结构性测试验证两个入口导出同一个 Application，Edge 的参数、响应、Controller 和 Logic 方法直接使用共享函数。

2026-11-13 本地验证：原有全仓库 1,279 项测试通过，Edge 12 项测试通过；最终 Node 核心 92 项测试复验通过。新增源码 ESLint 和 TypeScript 5.9.3 声明检查通过。

示例未压缩 ESM 为 429,090 字节；本机 Node 单次测量导入约 23.6 ms，初始化和首个请求约 7.0 ms。这不是平台冷启动保证。
