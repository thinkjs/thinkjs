# think-view-nunjucks
[![Build Status](https://travis-ci.org/thinkjs/think-view-nunjucks.svg?branch=master)](https://travis-ci.org/thinkjs/think-view-nunjucks)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-view-nunjucks/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-view-nunjucks?branch=master)
[![npm](https://img.shields.io/npm/v/think-view-nunjucks.svg?style=flat-square)](https://www.npmjs.com/package/think-view-nunjucks)

## Install

```
npm install think-view-nunjucks
```


## How to Usage

edit config file `src/config/adapter.js`, add options:

```js
const nunjucks = require('think-view-nunjucks');
exports.view = {
  type: 'nunjucks',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    extname: '.html',
    sep: '_' //seperator between controller and action
  },
  nunjucks: {
    handle: nunjucks,
    beforeRender: (env, nunjucks, config) => {}
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
### change options:

```js
exports.view = {
  type: 'nunjucks',
  nunjucks: {
    handle: nunjucks,
    options: {
      tags: {
        blockStart: '<%',
        blockEnd: '%>',
        variableStart: '<$',
        variableEnd: '$>',
        commentStart: '<#',
        commentEnd: '#>'
      }
    },
    beforeRender: (env, nunjucks, handleOptions) => {}
  }
}
```
you can find all nunjucks support options at https://mozilla.github.io/nunjucks/api.html#configure

### beforeRender

you can use `beforeRender` method to set some env:

```js
exports.view = {
  type: 'nunjucks',
  nunjucks: {
    handle: nunjucks,
    beforeRender: (env, nunjucks, handleOptions) => {
      env.addGlobal('think', think);
      env.addGlobal('JSON', JSON);
    }
  }
}
```
you can find all APIs in `env` at https://mozilla.github.io/nunjucks/api.html#environment
