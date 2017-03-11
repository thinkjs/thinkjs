# think-view-handlebars
[![Build Status](https://travis-ci.org/thinkjs/think-view-handlebars.svg?branch=master)](https://travis-ci.org/thinkjs/think-view-handlebars)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-view-handlebars/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-view-handlebars?branch=master)
[![npm](https://img.shields.io/npm/v/think-view-handlebars.svg?style=flat-square)](https://www.npmjs.com/package/think-view-handlebars)

## Install

```
npm install think-view-handlebars
```


## How to Usage

edit config file `src/config/adapter.js`, add options:

```js
const nunjucks = require('think-view-handlebars');
exports.view = {
  type: 'nunjucks',
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
change options:

```js
exports.view = {
  type: 'nunjucks',
  nunjucks: {
    handle: nunjucks,
    tags: {
      blockStart: '<%',
      blockEnd: '%>',
      variableStart: '<$',
      variableEnd: '$>',
      commentStart: '<#',
      commentEnd: '#>'
    },
    beforeRender: (env, nunjucks, config) => {}
  }
}
```
you can find all nunjucks support options by https://mozilla.github.io/nunjucks/api.html#configure

### beforeRender

you can use `beforeRender` method to set some env:

```js
exports.view = {
  type: 'nunjucks',
  nunjucks: {
    handle: nunjucks,
    beforeRender: (env, nunjucks, config) => {
      env.addGlobal('think', think);
      env.addGlobal('JSON', JSON);
    }
  }
}
```
you can find all APIs in `env` by https://mozilla.github.io/nunjucks/api.html#environment
