# think-router

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
  subdomainOffset: 2, 
  subdomain: {}, //subdomain
  denyModules: [] //deny module, enable in multi module mode
}
```
