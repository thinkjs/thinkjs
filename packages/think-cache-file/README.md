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
const fileCache = require('think-cache-file');
exports.cache = {
  type: 'file',
  common: {
    timeout: 24 * 60 * 60 * 1000, // millisecond
  },
  file: {
    handle: fileCache,
    cachePath: '/home/usr/data',  // absoulte path is necessarily required
    pathDepth: 1,
    gcInterval: 24 * 60 * 60 * 1000 // gc
  }
}
```
