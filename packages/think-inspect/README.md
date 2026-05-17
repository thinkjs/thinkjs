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
import Inspector from 'think-inspect';
...

const inspector = new Inspector({
  THINK_PATH: '/somepath/thinkjs',
  APP_PATH: '/somepath/app_path',
  ROOT_PATH: '/somepath/root_path',
  env: 'development',
  locale: 'locale'
  logger: thinkLoggerInstance
});
inspector.checkNodeVersion();
inspector.checkFileName();
inspector.checkDependencies();

```

## APIs

| API                 | Param                                    | Description                              |
| ------------------- | ---------------------------------------- | ---------------------------------------- |
| `checkNodeVersion`  |  | check if node version meets the requirement in package.json |
| `checkFileName`     |  | check if filenames in application are in lowercase |
| `checkDependencies` |  | check dependencies are installed before server starts |
