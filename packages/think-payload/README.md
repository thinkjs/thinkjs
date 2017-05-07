# think-payload
[![npm](https://img.shields.io/npm/v/think-payload.svg)](https://www.npmjs.com/package/think-payload)
[![Build Status](https://travis-ci.org/thinkjs/think-payload.svg?branch=master)](https://travis-ci.org/thinkjs/think-payload)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-payload/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-payload?branch=master)

Payload for Thinkjs 3.0

## Install

```
$ npm install think-payload --save
```

## How to use

config file `src/config/middleware.js`

```javascript
const payload = require('think-payload');

module.exports = [{
  handle: payload,
  options: {}
}];
```

## Data in Controller

```javascript
console.log(this.ctx.request.body); // {}
```

## multipart/form-data type in Controller
```
console.log(thsi.ctx.request.body);
/*
  {
    post: {
      key1: value
    },
    file: {
      file1: {...},
      file2: {...}
    }
  }
*/
```