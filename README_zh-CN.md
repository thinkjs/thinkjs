[![Coverage Status](https://p.ssl.qhimg.com/d/inn/e270ec1e/logo_large.jpg)](https://thinkjs.org/)

-----

[![NPM version](https://img.shields.io/npm/v/thinkjs.svg?style=flat-square)](http://badge.fury.io/js/thinkjs)
[![travis-ci](https://img.shields.io/travis/75team/thinkjs.svg?style=flat-square)](https://travis-ci.org/75team/thinkjs)
[![Coverage Status](https://img.shields.io/coveralls/75team/thinkjs.svg?style=flat-square)](https://coveralls.io/github/75team/thinkjs)


## Introduction

ThinkJS 是一款使用 ES6/7 特性全新开发的 Node.js MVC 框架，使用 ES7 中`async/await`，或者 ES6 中的 `Generator Function` 特性彻底解决了 Node.js 中异步嵌套的问题。同时吸收了国内外众多框架的设计理念和思想，让开发 Node.js 项目更加简单、高效。

使用 ES6/7 特性来开发项目可以大大提高开发效率，是趋势所在。并且新版的 Node.js 对 ES6 特性也有了较好的支持，即使有些特性还没有支持，也可以借助 [Babel](http://babeljs.io/) 编译来支持。


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
    let md5 = think.md5('think_' + data.pwd);
    //用户名和加密后的密码去匹配数据库中对于的条目
    let result = await this.model('user').where({name: data.name, pwd: md5}).find();
    //如果未匹配到任何数据，表示用户名或者密码错误
    if(think.isEmpty(result)){
      return this.fail('login fail');
    }
    //获取到用户信息后，将用户信息写入session
    await this.session('userInfo', result);
    return this.success();
  }
}
```


项目中可以大胆使用 ES6/7 里的所有特性，借助 Babel 编译，可以稳定运行在 `>=0.12.0` 的 Node.js 环境中。

## Features

* 使用 ES6/7 全部特性来开发项目
* 支持多种项目结构和多种项目环境
* 支持 Mysql，MongoDB，SQLite 等多种数据库
* 代码自动更新，无需重启 Node 服务
* 支持 socket.io，SockJS 等多种 WebSocket 库
* 支持 Memory，File，Db，Redis 等多种 Session
* 支持 Memory，File，Redis，Memcache 等多种 Cache
* 支持 ejs，jade，swig，numjucks 等多种模版引擎
* 支持切面编程，支持 __before，__after 等多种魔术方法
* 支持自定义 400，404，500，503 等多种错误页面
* 支持命令行调用和执行定时任务
* 丰富的 Hook 和 Middleware
* 详细的日志，如：请求日志、错误日志、性能日志
* 支持命令自动创建 REST API
* 支持国际化和多主题
* 丰富的测试用例，1500+ 测试用里，代码覆盖率 > 95%


## Installation

```sh
npm install -g thinkjs
```

## Create Application

```sh
thinkjs new project_path --es6
```

http://www.thinkjs.org/doc/create_project.html

## Start Application

```sh
cd project_path;
npm start
```

## Documentation

<https://thinkjs.org/>

## License

[MIT](https://github.com/75team/thinkjs/blob/master/LICENSE)
