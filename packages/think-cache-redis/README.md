# think-cache-redis
[![Build Status](https://travis-ci.org/thinkjs/think-cache-redis.svg?branch=master)](https://travis-ci.org/thinkjs/think-cache-redis)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-cache-redis/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-cache-redis?branch=master)
[![npm](https://img.shields.io/npm/v/think-cache-redis.svg?style=flat-square)](https://www.npmjs.com/package/think-cache-redis)

Use redis to cache data

## Install

```
npm install think-cache-redis
```


## How to Usage

edit config file `src/config/adapter.js`, add options:

```js
const redisCache = require('think-cache-redis');
exports.cache = {
  type: 'redis',
  redis: {
    handle: redisCache,
    timeout: 24 * 3600 * 1000, // millisecond
    redis: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
    }
  }
}
```
redis config see at https://github.com/luin/ioredis/blob/master/lib/redis.js
