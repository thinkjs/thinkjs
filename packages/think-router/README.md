# think-router
[![Build Status](https://travis-ci.org/thinkjs/think-router.svg?branch=master)](https://travis-ci.org/thinkjs/think-router)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-router/badge.svg)](https://coveralls.io/github/thinkjs/think-router)
[![npm](https://img.shields.io/npm/v/think-router.svg)](https://www.npmjs.com/package/think-router)

Router for ThinkJS 3.x

## Install

```
npm install think-router
```

## How to use

config file `src/config/middleware.js`

```js
const router = require('think-router');
module.exports = [
  {handle: router, options: {}}
];
```

support options:

```js
{
  defaultModule: 'home', //default module name, is enable in multi module mode
  defaultController: 'index', //default controller name
  defaultAction: 'index', //default action name
  prefix: [], // url prefix
  suffix: ['.html'], // url suffix
  enableDefaultRouter: true,
  optimizeHomepageRouter: true, 
  subdomainOffset: 2,
  subdomain: {}, //subdomain
  denyModules: [] //deny module, enable in multi module mode
}
```

## Router config

config file `src/config/router.js`

```js
module.exports = [
  ['/index', '/list']
]
```
