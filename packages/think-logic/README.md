# think-logic

[![Build Status](https://img.shields.io/travis/thinkjs/think-logic/master.svg?style=flat-square)](https://travis-ci.org/thinkjs/think-logic)
[![Coverage Status](https://img.shields.io/coveralls/thinkjs/think-logic/master.svg?style=flat-square)](https://coveralls.io/github/thinkjs/think-logic?branch=master)
[![npm](https://img.shields.io/npm/v/think-logic.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/think-logic)
[![devDependency Status](https://david-dm.org/thinkjs/think-logic.svg)](https://david-dm.org/thinkjs/think-logic)

Invoke logic for ThinkJS 3.x

## Install

```
npm install think-logic
```

## How to use

config file `src/config/middleware.js`

```js
const logic = require('think-logic');

module.exports = [
  logic 
]
```