# think-controller

[![Build Status](https://img.shields.io/travis/thinkjs/think-controller/master.svg?style=flat-square)](https://travis-ci.org/thinkjs/think-controller)
[![Coverage Status](https://img.shields.io/coveralls/thinkjs/think-controller/master.svg?style=flat-square)](https://coveralls.io/github/thinkjs/think-controller?branch=master)
[![npm](https://img.shields.io/npm/v/think-controller.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/think-controller)
[![devDependency Status](https://david-dm.org/thinkjs/think-controller.svg)](https://david-dm.org/thinkjs/think-controller)

Invoke controller for ThinkJS 3.x

## How To Use

Modify src/config/middleware.js:

```js
const controller = require('think-controller');

module.exports = [
  {
    handle: controller,
    options: {
      emptyModule: '',
      emptyController: '',
      preSetStatus: 200
    }
  }
];
```

## Options

* `emptyModule` {String} default module when not found
* `emptyController` {String} default controller when not found
* `preSetStatus` {Number} preset http status when action exist
    Koa set http status to 404 before request handling, and will changed when set body or status properties. when `preSetStatus` is set and action exist, it's will preset status before action invoked.
