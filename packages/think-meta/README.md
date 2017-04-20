# think-meta
[![Build Status](https://travis-ci.org/thinkjs/think-meta.svg?branch=master)](https://travis-ci.org/thinkjs/think-meta)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-meta/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-meta?branch=master)
[![npm](https://img.shields.io/npm/v/think-meta.svg?style=flat-square)](https://www.npmjs.com/package/think-meta)


Show meta for ThinkJS 3.x

## Install

```
npm install think-meta
```

## How to use

config file `src/config/middleware.js`

```js
const meta = require('think-meta');
module.exports = [
  {
    handle: meta,
    options: {

    }
  }
]
```

## Support options

```js
{
  requestTimeout: 10 * 1000, //request timeout, default is 10s
  requestTimeoutCallback: () => {}, //request timeout callback
  sendPowerBy: true,  //send powerby
  sendResponseTime: true, //send response time
  logRequest: true //log request
}
```
