# think-redis
[![Build Status](https://travis-ci.org/thinkjs/think-redis.svg?branch=master)](https://travis-ci.org/thinkjs/think-redis)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-redis/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-redis?branch=master)
[![npm](https://img.shields.io/npm/v/think-redis.svg?style=flat-square)](https://www.npmjs.com/package/think-redis)


## Install

```
npm install think-redis
```

## How to Usage

### default options

You can find all the config options at https://github.com/luin/ioredis/blob/master/lib/redis.js

```js
const defaultConfig = {
  port: 6379,          // Redis port
  host: '127.0.0.1',   // Redis host
  password: '',
};
```

### usage

```js
import Redis from '../index';

let redisInst = new Redis(config);

// set key
let s1 = await redisInst.set('name2', 'lushijie'); // never expire
let s2 = await redisInst.set('name3', 'lushijie', 3000); // milliseconds
let s3 = await redisInst.set('name4', 'lushijie', 'EX', 5); //seconds
let s4 = await redisInst.set('name5', 'lushijie', 'PX', 10000); //milliseconds

// get key's value
let g1 = await redisInst.get('name2');

// delete key
let d1 = await redisInst.delete(key);

// add event listener, supported events see at https://github.com/luin/ioredis
redisInst.on('connect', function() {
  // todo
});

// increase 1, if key not exist, set key's value eq 0 and then increase 1
await redisInst.increase(key);

// decrease 1, if key not exist, set key's value eq 0 then decrease 1
await redisInst.decrease(key);

```

