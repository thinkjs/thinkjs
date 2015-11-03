[![NPM version](https://img.shields.io/npm/v/thinkjs.svg?style=flat-square)](http://badge.fury.io/js/thinkjs) [![travis-ci](https://img.shields.io/travis/75team/thinkjs.svg?style=flat-square)](https://travis-ci.org/75team/thinkjs) [![Coverage Status](https://img.shields.io/coveralls/75team/thinkjs.svg?style=flat-square)](https://coveralls.io/github/75team/thinkjs)

[简体中文文档](https://github.com/75team/thinkjs/blob/master/README_zh-CN.md)

## Introduction 

As a Node.js MVC framework, ThinkJS 2.0 had completelly been rewritten with brand-new ECMAScript 6/7 features. By using ES7's `async/await` or ES6's `Generator Function` features, ThinkJS 2.0 could thoroughly solve the asynchronous nesting problem within Node.js. Also, has designed by absorb the concepts and ideas from many frameworks around the world, so developing Node.js projects with ThinkJS would be more simple and efficient than ever.

It's the trend that using ES6/7 features to develop projects thanks to the high development efficiency. The new version of Node.js has improved to support many ES6 featrues, though some features have not been supported until now, and for those features we can use [Babel](http://babeljs.io/) to compile the code.

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
    let md5 = think.md5('think_' + data.pwd);
    //user name and encrypted password are used to match the recod in the database
    let result = await this.model('user').where({name: data.name, pwd: md5}).find();
    //if nothing matched, mean user name or password is/or all are incorrect
    if(think.isEmpty(result)){
      return this.fail('login fail');
    }
    //obtain the user infomation, and write to the seesion
    await this.session('userInfo', result);
    return this.success();
  }
}
```

With the help of Babel compiling, we can use the ES6/7 features bodly, and then the code can running in the Node.js 0.12.0+ environment stably.

## Features

* Developing projects using all the new features of ES6/7.
* Supporting various project construct forms and environments.
* Supporting Mysql, MongoDB and SQLite databases.
* Automatically updating code, no need to restart Node.js server.
* Supporting various WebSocket libraries such as socket.io and SockJS.
* Supporting various Sessions such as Memory, File, Db and Redis.
* Supporting various Caches such as Memory, File, Redis and Memcache.
* Supporting various template engines such as ejs, jade, swig and numjucks.
* Supporting AOP, and magic methods such as __before and __after.
* Supporting 400, 404, 500 and 503 error pages.
* Supporting command-line call and crontab timing task execution.
* Multiple Hooks and Middlewares.
* Logs with details, such as requests, errors, performance, etc.
* Supporting commands that could auto create REST API.
* Supporting internationalization and multiple themes.
* 1500+ test cases, code coverage greater than 95%.

## Installation

```
npm install -g thinkjs
```

## Create Application

```sh
thinkjs new project_path --es6
```

http://www.thinkjs.org/doc/create_project.html

## Watch Compile

```sh
cd project_path;
npm run watch-compile
```

## Start Application

```sh
cd project_path;
npm start
```

## Documentation

<https://thinkjs.org/>

## License

[MIT](https://github.com/75team/thinkjs/blob/master/LICENSE)
