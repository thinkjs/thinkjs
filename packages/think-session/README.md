# think-session
[![Build Status](https://img.shields.io/travis/thinkjs/think-session/master.svg?style=flat-square)](https://travis-ci.org/thinkjs/think-session)
[![Coverage Status](https://img.shields.io/coveralls/thinkjs/think-session/master.svg?style=flat-square)](https://coveralls.io/github/thinkjs/think-session?branch=master)
[![npm](https://img.shields.io/npm/v/think-session.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/think-session)


Session for ThinkJS 3.x.

Add `session` method for controller/context.

## config

config file `src/config/adapter.js`, add options:

```js
const cookie = require('think-session-cookie');
exports.session = {
  type: 'cookie',
  common: {
    maxAge: 24 * 3600 * 1000, // 1 day 
  },
  cookie: {
    handle: cookie
  }
}
```

## session method

* `this.session()` get all session data
* `this.session(name)` get session data with name
* `this.session(name, value)` set session data
* `this.session(null)` delete all session data
* `this.session(name, undefined, options)` get session data with options

*For each `ctx`, session is only instantiated once.*
