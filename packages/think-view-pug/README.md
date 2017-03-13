# think-view-pug
[![Build Status](https://travis-ci.org/thinkjs/think-view-pug.svg?branch=master)](https://travis-ci.org/thinkjs/think-view-pug)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-view-pug/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-view-pug?branch=master)
[![npm](https://img.shields.io/npm/v/think-view-pug.svg?style=flat-square)](https://www.npmjs.com/package/think-view-pug)

## Install

```
npm install think-view-pug
```


## How to Usage

edit config file `src/config/adapter.js`, add options:

```js
const pug = require('think-view-pug');
exports.view = {
  type: 'pug',
  pug: {
    handle: pug,
    beforeRender: (env, pug, config) => {}
  }
}
```

### default options

```js
const defaultOptions = {
  autoescape: true,
  watch: false,
  noCache: false,
  throwOnUndefined: false
};
```
change options:

```js
exports.view = {
  type: 'pug',
  pug: {
    handle: pug,
    tags: {
      blockStart: '<%',
      blockEnd: '%>',
      variableStart: '<$',
      variableEnd: '$>',
      commentStart: '<#',
      commentEnd: '#>'
    },
    beforeRender: (env, pug, config) => {}
  }
}
```
you can find all pug support options by https://mozilla.github.io/pug/api.html#configure

### beforeRender

you can use `beforeRender` method to set some env:

```js
exports.view = {
  type: 'pug',
  pug: {
    handle: pug,
    beforeRender: (env, pug, config) => {
      env.addGlobal('think', think);
      env.addGlobal('JSON', JSON);
    }
  }
}
```
you can find all APIs in `env` by https://mozilla.github.io/pug/api.html#environment
