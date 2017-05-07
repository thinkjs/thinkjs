# think-gc
[![Build Status](https://travis-ci.org/thinkjs/think-gc.svg?branch=master)](https://travis-ci.org/thinkjs/think-gc)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-gc/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-gc?branch=master)
[![npm](https://img.shields.io/npm/v/think-gc.svg?style=flat-square)](https://www.npmjs.com/package/think-gc)


gc manager for ThinkJS 3.x

## Install

```
npm install think-gc
```

## How to use
```js
const gc = require('think-gc');

class handle {
  constructor(){
    this.gcType = 'session';
    gc(this, 3600 * 1000); //gc interval by 1 hour
  }
  gc(){
    //do gc task
  }
}
```
