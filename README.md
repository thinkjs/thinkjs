[![thinkjs](https://p.ssl.qhimg.com/d/inn/e270ec1e/logo_large.jpg)](https://thinkjs.org/)

-----

[![NPM version](https://img.shields.io/npm/v/thinkjs.svg?style=flat-square)](http://badge.fury.io/js/thinkjs)
[![travis-ci](https://img.shields.io/travis/75team/thinkjs.svg?style=flat-square)](https://travis-ci.org/75team/thinkjs)
[![Coverage Status](https://img.shields.io/coveralls/75team/thinkjs.svg?style=flat-square)](https://coveralls.io/github/75team/thinkjs)
[![Dependency Status](https://david-dm.org/75team/thinkjs.svg)](https://david-dm.org/75team/thinkjs)

[简体中文文档](https://github.com/75team/thinkjs/blob/master/README_zh-CN.md)


## Introduction 

As a Node.js MVC framework, ThinkJS 2.0 has completely been rewritten with brand-new ECMAScript 2015/2016 features. By using ES2016's `async/await` or ES2015's `Generator Function` features, ThinkJS 2.0 could thoroughly solve the asynchronous nesting problem within Node.js. Also, ThinkJS 2.0 has designed by absorbing the concepts and ideas of many frameworks around the world, so developing Node.js projects with ThinkJS would be more simple and efficient than ever.

It's a trend that using ES2015/2016 features to develop projects thanks to the high development efficiency. The new version of Node.js has improved to support many ES2015/2016 features, though some features have not been supported until now, and for those features we can use [Babel](http://babeljs.io/) to compile the code.

```js
//user controller, home/controller/user.js
export default class extends think.controller.base {
  //login action
  async loginAction(self){
    //if it's GET method，display the login page
    if(this.isGet()){
      return this.display();
    }
    //here, we can use POST retrieve all data, and the data have been validated in the logic
    let data = this.post();
    //user name to match the recod in the database
    let result = await this.model('user').where({name: data.name}).find();
    if(!validateLogin(result)){
      return this.fail('login fail');
    }
    //obtain the user infomation, and write to the seesion
    await this.session('userInfo', result);
    return this.success();
  }
}
```

With the help of Babel compiling, we can use the ES2015/2016 features boldly, and then the code can run in the Node.js 0.12.0+ environment stably.

## Features

* Developing projects using all the new features of ES2015+.
* Auto compiling & auto hot reload when file changed, no need to restart Node.js server.
* Supporting debug with ES2015+.
* Supporting TypeScript.
* Supporting various project construct forms and environments.
* Supporting MySQL, MongoDB, PostgreSQL and SQLite databases.
* Supporting various WebSocket libraries such as socket.io and SockJS.
* Supporting various Sessions such as Memory, File, Db and Redis.
* Supporting various Caches such as Memory, File, Redis and Memcache.
* Supporting various template engines such as ejs, jade, swig and nunjucks.
* Supporting AOP, and magic methods such as __before and __after.
* Supporting multistage Controller.
* Supporting 400, 404, 500 and 503 error pages.
* Supporting command-line call and crontab timing task execution.
* Multiple Hooks and Middlewares.
* Logs with details, such as requests, errors, performance, etc.
* Supporting commands that could automatically create REST API.
* Supporting internationalization and multiple themes.
* 1700+ test cases, code coverage greater than 95%.

## Installation

```sh
npm install -g thinkjs
```

## Create Application

```sh
thinkjs new demo --es
```

## Install dependencies

```sh
npm install
```

## Start Application

```sh
npm start
```

You will see some messages on console like :

```text
[2016-01-12 15:09:51] [THINK] Server running at http://127.0.0.1:8360/
[2016-01-12 15:09:51] [THINK] ThinkJS Version: 2.1.0
[2016-01-12 15:09:51] [THINK] Cluster Status: closed
[2016-01-12 15:09:51] [THINK] WebSocket Status: closed
[2016-01-12 15:09:51] [THINK] File Auto Compile: true
[2016-01-12 15:09:51] [THINK] File Auto Reload: true
[2016-01-12 15:09:51] [THINK] App Enviroment: development
```

## Performance comparsion

Evaluate whether a good framework, on the one hand to see the support of the function, it also depends on the performance. Although ThinkJS more suits for large projects, functions and complexity far exceeds Express and Koa, but the performance is not much less than the Express and Koa.

![thinkjs-performance](https://p.ssl.qhimg.com/t01897b6d34f6e0ea31.png)

`tips`: The above data using distributed stress testing system to test.

All we can see is that there has just little distance in ThinkJS and Express, Koa. ThinkJS and Sails.js both suits large projects, but ThinkJS has higher performance than Sails.js.

You can go <https://github.com/thinkjs-team/thinkjs-performance-test> to clone all testing code and run in local. If you use `ab` testing tool, you shoud know it is instability on Mac.

## Documentation

[https://thinkjs.org/en](https://thinkjs.org/en)

## License

[MIT](https://github.com/75team/thinkjs/blob/master/LICENSE)
