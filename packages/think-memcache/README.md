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

You can find all the config options at https://github.com/3rd-Eden/memcached

```js
const defaultOptions = {
  server: '127.0.0.1:11211',
  options: {
    maxExpiration: 2592000,
    maxKeySize: 250,
    maxValue: 1048576,
    algorithm: 'md5',
    timeout: 5000
  }
}
```

### usage

```js
import Memcache from '../index';

let memInst = new Memcache(config);

// set key, expire = milliseconds
let s1 = await memInst.set('name2', 'lushijie'); // expire = config.options.maxExpiration
let s2 = await memInst.set('name3', 'lushijie', 3000); // milliseconds
let s3 = await memInst.set('name4', 'lushijie', 'EX', 5); //seconds
let s4 = await memInst.set('name5', 'lushijie', 'PX', 3000); //milliseconds

// get key's value
let g1 = await memInst.get('name2');

// delete key
await memInst.delete(key);

// add event listener, supported events https://github.com/3rd-Eden/memcached
memInst.on('failure', function() {
  // todo
});

// increase 1, if key'value is not integer will reject(err)
await memInst.increase(key);

// decrease 1, if key'value is not integer will reject(err)
await memInst.decrease(key);

```

