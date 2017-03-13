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
    beforeRender: (pug, config) => {
      // todo
    }
  }
}
```

### default options

```js
const defaultOptions = {
  cache: false,
  debug: false
};
```
change options:

```js
exports.view = {
  type: 'pug',
  pug: {
    handle: pug,
    cache: true,
    self: true,
    beforeRender: (pug, config) => {
      // todo
    }
  }
}
```
you can find all pug support options at https://pugjs.org/api/reference.html

### beforeRender

you can use `beforeRender` method to enhance pug:

```js
exports.view = {
  type: 'pug',
  pug: {
    handle: pug,
    beforeRender: (pug, config) => {
      pug.filters['my-own-filter'] = (text, options) => {
        if (options.addStart) text = 'Start\n' + text;
        if (options.addEnd)   text = text + '\nEnd';
        return text;
      };
    }
  }
}
```
you can find all APIs at https://pugjs.org/api/reference.html
