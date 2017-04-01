# think-cache-memcache
[![Build Status](https://travis-ci.org/thinkjs/think-cache-memcache.svg?branch=master)](https://travis-ci.org/thinkjs/think-cache-memcache)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-cache-memcache/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-cache-memcache?branch=master)
[![npm](https://img.shields.io/npm/v/think-cache-memcache.svg?style=flat-square)](https://www.npmjs.com/package/think-cache-memcache)

Use memcache to cache data

## Install

```
npm install think-cache-memcache
```


## How to Usage

edit config file `src/config/adapter.js`, add options:

```js
const memcacheCache = require('think-cache-memcache');
exports.cache = {
  type: 'memcache',
  common: {
    timeout: 24 * 3600 * 1000 // millisecond, default timeout for function set
  },
  memcache: {
    handle: memcacheCache,
    hosts: ['127.0.0.1:11211'],
    maxValueSize: 1048576,
    netTimeout: 5000,
    reconnect: true
  }
}
```
memcache config see at http://memcache-plus.com/
