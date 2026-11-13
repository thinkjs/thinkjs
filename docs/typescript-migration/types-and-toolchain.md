# P0：声明、应用模板与编译链基线

## 范围与证据

审计基线为 `aa9cdde600db87c332e5c98f704024e1a66788f4`。这里记录既有契约和缺口，不把应用 TS 支持等同于框架源码迁移。没有更改生产源码、声明或编译器依赖。

- Node 本地验证版本：24.22.1。`.github/workflows/test.yml` 的 CI 矩阵为 22.x / 24.x / 26.x；这不是三版本均已在本地验证的声明。根包及核心包 engines 为 `>=20.19.0`，Node 20 不在该 CI 矩阵中。
- `think-typescript/package.json` 请求 TypeScript `^3.5.3`；当前锁文件和安装解析为 **3.9.10**。不能把请求范围误报为实际使用 3.5.3。
- PR [#1791](https://github.com/thinkjs/thinkjs/pull/1791) 的远端 head 为 `5e59a9f84bd2ec85c235b70976a650895b58211e`，现有本地 pilot HEAD 为 `a21b15a61bcd373ca6376dc65e375f0cf321d77b`。二者提交不同，但本次 `git rev-parse <commit>^{tree}` 均为 `7042cfce72e4f0f3bb4554ec81fa993e08734eb5`，`git diff` 为空；以下 pilot 文件级结论适用于这个相同树，不宣称两个提交相同。

## 现有声明与运行时不一致

文件：`packages/thinkjs/index.d.ts`、`lib/application.js`、`lib/think.js`、`lib/extend/{context,controller}.js`。

1. 包的 CommonJS main 返回 Application **构造器**；声明只提供命名接口，`import Application = require('thinkjs'); new Application(...)` 报 TS2351。声明中的 `Application extends Koa` 实际对应 `think.app` 的一部分，而不是 main 构造器的 options/run/watch 行为。后续声明设计须分开这两个概念。
2. 声明有 `export var think` 和 `declare global { var think: Think }`。全局及命名导入在 skipLibCheck 消费者中均能编译，但运行时 main 没有 `.think` 导出，加载 loader 才初始化 `global.think`。**类型可编译不代表命名 value import 能运行**；不可在 P0 悄悄增加运行时导出。
3. `beforeStartServer(fn: Function): Promise<any>` 不符合真实分支：有 fn 时执行并入队，返回 `push` 的 number；无 fn 时返回等待 Promise，而声明缺少此零参数调用。消费者确认后者报 TS2554。
4. `TController extends Controller`、`TLogic extends Logic` 把实例成员放在构造器一侧；`Service` 把构造签名和实例类型混用。当前 subclass 基本用法可通过，但不能因此宣布静态/实例建模正确。
5. `Think.service`、Controller/Context 服务 API 依赖大量 any/宽泛重载，未表达注册表键、构造参数或实例类型。尤其 Controller.service 在多模块中推断当前模块，Context.service 只转发 think.service，默认回到 common；不能先假设三者选择模块语义一致。
6. 当前依赖安装不提供核心声明所需的完整可解析类型链。严格验证实际报缺少 `koa` 声明、`node` 类型及 `NodeJS` 命名空间。`skipLibCheck: true` 的基线只证明选定消费者表面，不是完整声明健全性。后续应明确 `@types/koa` / Node 类型的所有权及兼容版本，再补 `skipLibCheck: false` 契约门禁。

## CLI 模板不是当前框架源码

CLI `new` 默认指向 git submodule `packages/think-cli/default_template`，本次 checkout 未初始化。审计单独取出下列固定提交，不修改 submodule 或缓存，不把历史缓存作为现行来源：

- 标准 JS 模板：[think-template/standard @ e9bd0d6](https://github.com/think-template/standard/tree/e9bd0d67a77e7f6f6b21b5d92a78ca67103d97f6)。
- TS 模板：[think-template/typescript @ 3c94394](https://github.com/think-template/typescript/tree/3c9439439f8046faa6b3d0219cab15be6fd8db9c)，由 CLI README 链接，是独立仓库。


### JS 模板

`metadata.js` 同时映射 single/multi module；多模块 bootstrap/config 进入 common。未启用 Babel 时开发和生产均使用 src，开发配置 watcher，生产不配置 watcher。启用 Babel 时使用 app，开发通过 think-babel 增量转译，compile 使用 Babel CLI。模板旧依赖含 thinkjs ^3.2.15、eslint ^4.2.0、AVA ^0.18.0、Node >=8.15.1；不能直接等同当前 ThinkJS 4 的依赖门禁。

### TS 模板

- package 请求 TS ^2.5.3、think-typescript ^1.0.4、thinkjs ^3.2.11、thinkjs3-ts ^1.0.1，`@types/koa: *`；与本仓库 think-typescript 2.0.0/TS3.9.10 不同。
- `start` 是 `node development.js`；`compile` 是 `npm run lint && tsc`；lint 仍为 TSLint。tsconfig 使用 CommonJS / ES2017、outDir app、noImplicitAny，**不是 strict**。
- development.js 的 think-typescript 选项手动重复 tsconfig 的一部分，并不读取该文件；生产 production.js 只运行已构建 app，不自动编译，也不配置 watcher。
- single/multi 映射中包含 `src/index.ts`、model/test 等源路径，但本次固定树并没有这些源文件，映射清单不是文件存在性证明。
- `suppressImplicitAnyIndexErrors` 已被现代 TS 移除；`esModuleInterop` 又晚于最低请求版本 TS2.5 引入。必须用一个明确、锁定的现代版本重做生成应用测试，而非仅提高版本号。

### 资源、bootstrap、watch

核心 `Application.startWatcher` 把 ROOT_PATH/src 与 APP_PATH 交给 watcher；callback 按文件调用 transpiler，返回 Error 时不 reload，有 masterInstance 时成功后 reload workers。think-watcher 默认只接收 js/es/ts，过滤隐藏路径，不复制 JSON/HTML 等资源。think-typescript 只写当前文件 JS 和可选 map，不复制资源。模板 view / www 路径由脚手架映射保留在项目外层，而不是通过 tsc 自动拷贝。

loader 在 APP_PATH 查找 bootstrap/master.js 和 worker.js；开发由 watcher 产物供加载，生产依赖预先编译。需要分别覆盖初次启动、修改/删除、失败恢复、资源策略和生产 bootstrap，不能拿单文件 emit 成功替代完整开发/生产验收。

## 转译不等于类型检查

`think-typescript/index.js` 调用 `ts.transpileModule`，不是构建整个 Program。`reportDiagnostics: true` 能返回语法/选项诊断，不能保证跨文件解析、参数类型或赋值语义正确。

新增 fixture 故意使用 `const answer: number = 'not a number'`：实际转译成功并写 JS/map，而 Program 检查报 TS2322。默认 options 是浅合并，传入 compilerOptions 会整体替换默认 compilerOptions；sourceMap/target 等不能假设继续继承。后续开发可以保留快速转译，但 CI/build 必须有独立 `tsc --noEmit` 或等价语义检查门禁。

## #1791 pilot 与最低 TS 策略

现有 think-debounce pilot 已提供 src、生成 CommonJS/index.d.ts、严格类型消费者与 pack 测试，应复用而不是另起一个相同迁移。其工具编译器精确固定 **TS5.9.3**、Node 类型 ^22.20.5，目标 ES2018，module CommonJS。

生成声明为 `debounce<T>(key: string, fn: () => T): Promise<Awaited<T>>`。`Awaited` 的标准库支持起于 **TS4.5**，因此 TS3.9 消费者确实不兼容。用本地 TS3.9.10 实跑 pilot 类型消费者报 TS2304（Awaited）以及后续推断错误；TS5.9.3 的打包消费验证通过。**TS4.5 是特性下限推导，不是已完成 TS4.5 全量消费验收**；不要据此直接承诺所有包最低 TS4.5。

本次将 pilot 包拷贝到临时目录，链接现有编译器后运行其原版 `test/pack.cjs`，原 pilot 保持干净：prepack/build、五文件 tarball 布局、临时安装、JS require/direct deep path、严格 TS 消费者以及打包后 7 个运行时回归均通过。初次复制继承了相对 pnpm 链接，因路径失效未能启动 tsc；修正临时目录链接后通过，未修改原 pilot。

建议分别声明：维护者工具版本、发布声明消费者最低 TS、生成应用 TS 版本。采用 TS5.9.3 作为下一阶段候选工具链已有 pilot 证据；是否承诺 TS4.5 消费者或改用自定义 Awaited 兼容类型，应在 P2 用真实版本矩阵决策。

历史 [#1729](https://github.com/thinkjs/thinkjs/issues/1729) 的 Node22 模板编译问题在本次**未复现**。上述模板陈旧选项/声明缺失不能当作该 issue 根因，也与 #1791 模块源码 pilot 的成功或失败不是同一结论。

## 新增可重复门禁

运行 `node --test test/typescript-migration/toolchain.test.cjs`。默认从 think-typescript 解析已安装编译器，不下载依赖。可用 `THINKJS_AUDIT_TYPESCRIPT=/absolute/path/to/typescript` 切换消费者/compiler API 检查；适配器 emit 测试仍执行实际安装的 think-typescript/TS3.9.10，不冒充使用覆盖版本。

8 项测试覆盖：全局/命名类型表面及继承、构造器/零参 hook 已知缺口、完整声明检查当前失败、语义检查与转译区别、嵌套 JS/map 与语法错误、watch 默认文件过滤、TS emit 后 single/multi CommonLoader 服务加载及 Controller/Context 调用。最后两项验证 default class 和 `export =` 对象、__filename、模块选择；不启动 HTTP，不执行完整生成应用安装/dev/build/start。所有写入均在临时目录并清理。

Node24.22.1 下 TS3.9.10 与 TS5.9.3 各 **8/8 通过**。已知缺口测试是有意的 P0 characterization；未来修复时应替换为正向契约，不应把错误永久保留。完整模板安装、Node22/26 本地复验、TS4.5 最低版消费及完整资源/bootstrap/watch 集成仍需后续阶段验收。
