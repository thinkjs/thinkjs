# think-inspect
[![Build Status](https://img.shields.io/travis/thinkjs/think-inspect/master.svg?style=flat-square)](https://travis-ci.org/thinkjs/think-inspect)
[![Coverage Status](https://img.shields.io/coveralls/thinkjs/think-inspect/master.svg?style=flat-square)](https://coveralls.io/github/thinkjs/think-inspect?branch=master)
[![npm](https://img.shields.io/npm/v/think-inspect.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/think-inspect)


`think-inspect` checks if a project meets the requirement of ThinkJS 3.0

## Usage

Using npm:

```sh
npm install think-inspect
```

In Node.js:

```js
import thinkInspect from 'think-inspect';

thinkInspect.checkNodeVersion({
  THINK_PATH: 'test/demo/checkNodeVersion'
}, (errmsg, type)=> {
  console.log(errmsg);
});
```

## APIs

| API                 | Param                                    | Description                              |
| ------------------- | ---------------------------------------- | ---------------------------------------- |
| `checkNodeVersion`  | `config`: {Object}<br>`callback`: {Function} | check if node version meets the requirement in package.json |
| `checkFileName`     | `config`: {Object}<br>`callback`: {Function} | check if filenames in application are in lowercase |
| `checkDependencies` | `config`: {Object}<br>`callback`: {Function} | check dependencies are installed before server starts |
