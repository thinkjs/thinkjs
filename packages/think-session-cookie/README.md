# think-session-cookie
[![Build Status](https://travis-ci.org/thinkjs/think-session-cookie.svg?branch=master)](https://travis-ci.org/thinkjs/think-session-cookie)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-session-cookie/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-session-cookie?branch=master)
[![npm](https://img.shields.io/npm/v/think-session-cookie.svg?style=flat-square)](https://www.npmjs.com/package/think-session-cookie)

Use cookie to store session

## Install

```
npm install think-session-cookie
```

## How to use

config file `src/config/adapter.js`, add options:

```js
const cookie = require('think-session-cookie');
exports.session = {
  type: 'cookie',
  common: {
    cookie: {
      name: 'thinkjs',
      autoUpdate: false, //auto update cookie when maxAge is set
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
  cookie: {
    handle: cookie,
    cookie: {
      encrypt: false //encrypt cookie data
    }
  }
}
```
