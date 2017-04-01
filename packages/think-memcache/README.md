# think-memcache
[![Build Status](https://travis-ci.org/thinkjs/think-memcache.svg?branch=master)](https://travis-ci.org/thinkjs/think-memcache)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-memcache/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-memcache?branch=master)
[![npm](https://img.shields.io/npm/v/think-memcache.svg?style=flat-square)](https://www.npmjs.com/package/think-memcache)


## Install

```
npm install think-memcache
```

## How to Usage

### default options

You can find all the config options at http://memcache-plus.com/

```js
const defaultOptions = {
  hosts: ['127.0.0.1:11211'],
  maxValueSize: 1048576,
  netTimeout: 5000,
  reconnect: true
}
```

### usage

```js
import Memcache from '../index';

let memInst = new Memcache(config);

// set key, expire should be milliseconds
let s1 = await memInst.set('name2', 'lushijie'); // expire = 0
let s2 = await memInst.set('name3', 'lushijie', 3000); // milliseconds

// get key's value
let g1 = await memInst.get('name2');

// delete key
await memInst.delete(key);

// increase 1, key'value should be integer, if key not exist will do nothing
await memInst.increase(key);

// decrease 1, key'value should be integer, if key not exist will do nothing
await memInst.decrease(key);

```

