# think-pm2

[![npm](https://img.shields.io/npm/v/think-pm2.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/think-pm2)
[![devDependency Status](https://david-dm.org/thinkjs/think-logic.svg)](https://david-dm.org/thinkjs/think-logic)


PM2 detect for ThinkJS

## Install

```
npm install think-pm2
```

## How to use

```js
const pm2 = require('think-pm2');
//use pm2 to manage node process
const inPM2 = pm2.inPM2; 
//set "exec_mode" = "cluster" in pm2 config
const isClusterMode = pm2.isClusterMode; 
```