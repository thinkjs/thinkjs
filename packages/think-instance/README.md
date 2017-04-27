# think-instance
[![Build Status](https://travis-ci.org/thinkjs/think-instance.svg?branch=master)](https://travis-ci.org/thinkjs/think-instance)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-instance/badge.svg)](https://coveralls.io/github/thinkjs/think-instance)
[![npm](https://img.shields.io/npm/v/think-instance.svg)](https://www.npmjs.com/package/think-instance)


## Install

```
npm install think-instance
```

## How to Use

```js
const thinkInstance = require('think-instance');
let cls = class {
  constructor(conf1, conf2){

  }
}
cls = thinkInstance(cls);
const instance = cls.getInstance(conf1, conf2);
```