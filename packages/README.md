# ThinkJS Monorepo

这是 [ThinkJS](https://thinkjs.org) 的 monorepo，使用 npm workspaces 管理。

## 包结构

| 包名 | 描述 | 版本 |
|------|------|------|
| [thinkjs](.) | ThinkJS 主框架 | [![](https://img.shields.io/npm/v/thinkjs)](https://www.npmjs.com/package/thinkjs) |
| [think-helper](packages/think-helper) | ThinkJS 工具函数 | [![](https://img.shields.io/npm/v/think-helper)](https://www.npmjs.com/package/think-helper) |
| [think-cluster](packages/think-cluster) | 集群管理 | [![](https://img.shields.io/npm/v/think-cluster)](https://www.npmjs.com/package/think-cluster) |
| [think-config](packages/think-config) | 配置管理 | [![](https://img.shields.io/npm/v/think-config)](https://www.npmjs.com/package/think-config) |
| [think-controller](packages/think-controller) | Controller 调用 | [![](https://img.shields.io/npm/v/think-controller)](https://www.npmjs.com/package/think-controller) |
| [think-crontab](packages/think-crontab) | 定时任务 | [![](https://img.shields.io/npm/v/think-crontab)](https://www.npmjs.com/package/think-crontab) |
| [think-loader](packages/think-loader) | 加载器 | [![](https://img.shields.io/npm/v/think-loader)](https://www.npmjs.com/package/think-loader) |
| [think-logger3](packages/think-logger) | 日志 | [![](https://img.shields.io/npm/v/think-logger3)](https://www.npmjs.com/package/think-logger3) |
| [think-logic](packages/think-logic) | Logic 调用 | [![](https://img.shields.io/npm/v/think-logic)](https://www.npmjs.com/package/think-logic) |
| [think-meta](packages/think-meta) | Meta 中间件 | [![](https://img.shields.io/npm/v/think-meta)](https://www.npmjs.com/package/think-meta) |
| [think-mock-http](packages/think-mock-http) | HTTP Mock | [![](https://img.shields.io/npm/v/think-mock-http)](https://www.npmjs.com/package/think-mock-http) |
| [think-payload](packages/think-payload) | 请求体解析 | [![](https://img.shields.io/npm/v/think-payload)](https://www.npmjs.com/package/think-payload) |
| [think-pm2](packages/think-pm2) | PM2 支持 | [![](https://img.shields.io/npm/v/think-pm2)](https://www.npmjs.com/package/think-pm2) |
| [think-resource](packages/think-resource) | 静态资源 | [![](https://img.shields.io/npm/v/think-resource)](https://www.npmjs.com/package/think-resource) |
| [think-router](packages/think-router) | 路由 | [![](https://img.shields.io/npm/v/think-router)](https://www.npmjs.com/package/think-router) |
| [think-trace](packages/think-trace) | 错误追踪 | [![](https://img.shields.io/npm/v/think-trace)](https://www.npmjs.com/package/think-trace) |
| [think-validator](packages/think-validator) | 参数验证 | [![](https://img.shields.io/npm/v/think-validator)](https://www.npmjs.com/package/think-validator) |

## 快速开始

### 安装依赖

```bash
npm install
```

这会安装根目录和所有 packages/* 中包的依赖，并自动为内部包之间建立符号链接。

### 开发工作流

```bash
# 运行所有包的测试
npm run packages:test

# 运行所有包的 lint
npm run packages:lint

# 对特定包执行命令
npm run test --workspace=packages/think-helper
npm run test --workspace=packages/think-cluster
```

### 新增包

在 `packages/` 目录下创建新目录并添加 `package.json`，npm workspaces 会自动识别。

## 开发

```bash
# clone 仓库
git clone https://github.com/thinkjs/thinkjs.git
cd thinkjs

# 安装所有依赖
npm install

# 启动开发调试
npm test
```

## 发布

每个子包可以独立发布到 npm。进入对应包目录后执行 `npm publish`。

## 贡献

欢迎提交 PR！请参考 [贡献指南](CONTRIBUTING.md)。

## 许可证

MIT
