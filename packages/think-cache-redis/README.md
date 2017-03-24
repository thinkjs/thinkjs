# think-cache-file
[![Build Status](https://travis-ci.org/thinkjs/think-cache-file.svg?branch=master)](https://travis-ci.org/thinkjs/think-cache-file)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-cache-file/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-cache-file?branch=master)
[![npm](https://img.shields.io/npm/v/think-cache-file.svg?style=flat-square)](https://www.npmjs.com/package/think-cache-file)

Use file to cache data

## Install

```
npm install think-cache-file
```


## How to Usage

edit config file `src/config/adapter.js`, add options:

```js
const cacheFile = require('think-cache-file');
exports.cache = {
  type: 'file',
  file: {
    handle: cacheFile,
    timeout: 24 * 60 * 60 * 1000, // millisecond
    cachePath: '/home/usr/data',  // absoulte path is necessarily required
    pathDepth: 1
  }
}
```


### default options

```js
const defaultOptions = {
  timeout = 24 * 60 * 60 * 1000, // millisecond
  pathDepth = 1,
  // cachePath don't have default value and must set an absolute path
};

