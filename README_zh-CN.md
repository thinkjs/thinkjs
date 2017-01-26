[![Coverage Status](https://p.ssl.qhimg.com/d/inn/e270ec1e/logo_large.jpg)](https://thinkjs.org/)

-----

[![NPM version](https://img.shields.io/npm/v/thinkjs.svg?style=flat-square)](http://badge.fury.io/js/thinkjs)
[![travis-ci](https://img.shields.io/travis/75team/thinkjs.svg?style=flat-square)](https://travis-ci.org/75team/thinkjs)
[![Coverage Status](https://img.shields.io/coveralls/75team/thinkjs.svg?style=flat-square)](https://coveralls.io/github/75team/thinkjs)
[![Dependency Status](https://david-dm.org/75team/thinkjs.svg)](https://david-dm.org/75team/thinkjs)


## 介绍

ThinkJS 是一款使用 ES2015/2016 特性全新开发的 Node.js MVC 框架，使用 ES2016 中 `async/await`，或者 ES2015 中的 `Generator Function` 特性彻底解决了 Node.js 中异步嵌套的问题。同时吸收了国内外众多框架的设计理念和思想，让开发 Node.js 项目更加简单、高效。

使用 ES2015/2016 特性来开发项目可以大大提高开发效率，是趋势所在。并且新版的 Node.js 对 ES6 特性也有了较好的支持，即使有些特性还没有支持，也可以借助 [Babel](http://babeljs.io/) 编译来支持。


```js
//user controller, home/controller/user.js
export default class extends think.controller.base {
  //login action
  async loginAction(self){
    //如果是get请求，直接显示登录页面
    if(this.isGet()){
      return this.display();
    }
    //这里可以通过post方法获取所有的数据，数据已经在logic里做了校验
    let data = this.post();
    //用户名去匹配数据库中对于的条目
    let result = await this.model('user').where({name: data.name}).find();
    if(!validateLogin(result)){
      return this.fail('login fail');
    }
    //获取到用户信息后，将用户信息写入session
    await this.session('userInfo', result);
    return this.success();
  }
}
```


项目中可以大胆使用 ES2015/2016 里的所有特性，借助 Babel 编译，可以稳定运行在 `>=0.12.0` 的 Node.js 环境中。

## 特性

* 支持使用 ES2015+ 全部特性来开发项目
* 支持断点调试 ES2015+ 项目
* 支持使用 TypeScript 开发项目
* 支持多种项目结构和多种项目环境
* 支持多级 Controller
* 支持 MySQL，MongoDB，SQLite, PostgreSQL 等多种数据库
* 代码自动更新，无需重启 Node 服务
* 支持 socket.io，SockJS 等多种 WebSocket 库
* 支持 Memory，File，Db，Redis 等多种 Session
* 支持 Memory，File，Redis，Memcache 等多种 Cache
* 支持 ejs，jade，swig，nunjucks 等多种模版引擎
* 支持切面编程，支持 __before，__after 等多种魔术方法
* 支持自定义 400，404，500，503 等多种错误页面
* 支持命令行调用和执行定时任务
* 丰富的 Hook 和 Middleware
* 详细的日志，如：请求日志、错误日志、性能日志
* 支持命令自动创建 REST API
* 支持国际化和多主题
* 丰富的测试用例，1500+ 测试用例，代码覆盖率 > 95%


## 安装 ThinkJS

```sh
npm install -g thinkjs
```

## 创建项目

```sh
thinkjs new demo
```

## 安装依赖

```sh
npm install
```

## 启动服务

```sh
npm start
```

启动后，会看到类似下面的信息：

```text
[2016-01-12 15:09:51] [THINK] Server running at http://127.0.0.1:8360/
[2016-01-12 15:09:51] [THINK] ThinkJS Version: 2.1.0
[2016-01-12 15:09:51] [THINK] Cluster Status: closed
[2016-01-12 15:09:51] [THINK] WebSocket Status: closed
[2016-01-12 15:09:51] [THINK] File Auto Compile: true
[2016-01-12 15:09:51] [THINK] File Auto Reload: true
[2016-01-12 15:09:51] [THINK] App Enviroment: development
```

## 性能对比

评价一个框架是否出色，一方面看支持的功能，另一方面也要看性能。虽然 ThinkJS 更适合大型项目，功能和复杂度远远超过 Express 和 Koa，但性能上并不比 Express 和 Koa 逊色多少，具体的测试数据请见下图。

![ThinkJS 性能测试](https://p.ssl.qhimg.com/t018bc14974bff742de.jpg)

`注`：以上数据使用分布式压力测试系统测试。


从上图中测试数据可以看到，虽然 ThinkJS 比 Express 和 Koa 性能要差一些，但差别并不大。ThinkJS 和 Sails.js 都更符合大型项目，但 ThinkJS 的性能要比 Sails.js 高很多。

具体测试代码请见：<https://github.com/thinkjs-team/thinkjs-performance-test>，可以下载代码在本机测试，如果使用 `ab` 测试工具，请注意该工具在 Mac 系统下很不稳定，多次测试结果会相差很大。

## 文档

<https://thinkjs.org/>

## 讨论组

* QQ 群：339337680

## License

[MIT](https://github.com/75team/thinkjs/blob/master/LICENSE)
