# think-redis
[![Build Status](https://travis-ci.org/thinkjs/think-redis.svg?branch=master)](https://travis-ci.org/thinkjs/think-redis)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-redis/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-redis?branch=master)
[![npm](https://img.shields.io/npm/v/think-redis.svg?style=flat-square)](https://www.npmjs.com/package/think-redis)


## Install

```
npm install think-redis
```

## How to Usage


```js
import Redis from '../index';

// default options
let defaultOptions = {
  port: 6379,          // Redis port
  host: '127.0.0.1',   // Redis host
  password: '',
};

let redisInst = new Redis(helper.extend({}, defaultOptions));

// set key
let s1 = await redisInst.set('name2', 'lushijie');
let s2 = await redisInst.set('name3', 'lushijie', 3);
let s3 = await redisInst.set('name4', 'lushijie', 'EX', 5);
let s4 = await redisInst.set('name5', 'lushijie', 'PX', 10000);

// get key
let g1 = await redisInst.get('name2');

// delete key
let d1 = await redisInst.delete(key);

// add event listener
redisInst.on('connect', function() {
  // todo
});

```
You can find all the config options at https://github.com/luin/ioredis/blob/master/lib/redis.js
