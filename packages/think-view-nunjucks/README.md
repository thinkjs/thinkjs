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
  nunjucks: {
    handle: nunjucks,
    beforeRender: (config, nunjucks, env) => {}
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

### beforeRender


