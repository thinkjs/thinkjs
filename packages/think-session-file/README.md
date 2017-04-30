# think-session-file

File session for ThinkJS

[![Build Status](https://img.shields.io/travis/thinkjs/think-session-file/master.svg?style=flat-square)](https://travis-ci.org/thinkjs/think-session-file)
[![Coverage Status](https://img.shields.io/coveralls/thinkjs/think-session-file/master.svg?style=flat-square)](https://coveralls.io/github/thinkjs/think-session-file?branch=master)
[![npm](https://img.shields.io/npm/v/think-session-file.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/think-session-file)

## Install

```
npm install think-session-file
```

## How to use

config file `src/config/adapter.js`, add options:

```js
const fileSession = require('think-session-file');
exports.session = {
  type: 'file',
  common: {
    cookie: {
      name: 'thinkjs',
      //maxAge: '',
      //expires: '',
      path: '/',  //a string indicating the path of the cookie
      //domain: '',
      //secure: false,
      //keys: [],
      httpOnly: true,
      sameSite: false,
      signed: false,
      overwrite: false
    }
  },
  file: {
    handle: fileSession,
    sessionPath: path.join(think.ROOT_PATH, 'runtime/session'), //file session store root path
    maxAge: '1d', //session timeout, default is 1 day
    autoUpdate: false, //update expires time when get session, default is false
  }
}
```
