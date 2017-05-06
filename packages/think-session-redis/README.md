# think-session-redis
Use Redis to store session for ThinkJS

[![Build Status](https://img.shields.io/travis/thinkjs/think-session-redis/master.svg?style=flat-square)](https://travis-ci.org/thinkjs/think-session-redis)
[![Coverage Status](https://img.shields.io/coveralls/thinkjs/think-session-redis/master.svg?style=flat-square)](https://coveralls.io/github/thinkjs/think-session-redis?branch=master)
[![npm](https://img.shields.io/npm/v/think-session-redis.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/think-session-redis)


## Install

```
npm install think-session-redis
```

## How to use

config file `src/config/adapter.js`, add options:

```js
const redisSession = require('think-session-redis');
exports.session = {
  type: 'redis',
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
  redis: {
    handle: redisSession,
    maxAge: 3600 * 1000, //session timeout, if not set, session will be persistent.
    autoUpdate: false, //update expired time when get session, default is false
  }
}
```
