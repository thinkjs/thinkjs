# think-websocket
[![Build Status](https://travis-ci.org/thinkjs/think-websocket.svg?branch=master)](https://travis-ci.org/thinkjs/think-websocket)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-websocket/badge.svg)](https://coveralls.io/github/thinkjs/think-websocket)
[![npm](https://img.shields.io/npm/v/think-websocket.svg)](https://www.npmjs.com/package/think-websocket)

WebSocket Extend for ThinkJS 3.x

## Install

```
npm install think-websocket
```

## How to Use

Edit config file `src/config/extend.js`, add options:

const websocket = require('think-websocket');
module.exports = [
  // ...
  websocket(think.app),
];
