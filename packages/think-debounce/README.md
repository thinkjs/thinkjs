# think-debounce
[![Build Status](https://img.shields.io/travis/thinkjs/think-debounce/master.svg?style=flat-square)](https://travis-ci.org/thinkjs/think-debounce)
[![Coverage Status](https://img.shields.io/coveralls/thinkjs/think-debounce/master.svg?style=flat-square)](https://coveralls.io/github/thinkjs/think-debounce?branch=master)
[![npm](https://img.shields.io/npm/v/think-debounce.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/think-debounce)

`think-debounce` runs a time-consuming operation. The operation may be called several times concurrently, but within `think-debounce`, it will only be run once before it's finished.

In particular, You can use `think-debounce` to avoid duplicate requests for a remote API.

## Syntax

```js
import Debounce from 'think-debounce';
const instance = new Debounce();
instance.debounce(key, callback);
```

- `key` {String} the identity of the operation.
- `callback` {Function} the function which contains the operation and returns a Promise object.
- return {Object} a Promise object.

## Usage

Take reading a local file for an example:

```js
import Debounce from 'think-debounce';
import fs from 'fs';

let instance = new Debounce();
let readTimes = 0;
let awaitKey = 'readMyFile';
let filePath = '../my/file/path';
let readMyFileCallback = () => {
  return new Promise((resolve, reject) => {
    // even if `readMyFile` operation is called several times,
    // `readMyFileCallback` will only be run once before it's finished.
    readTimes ++;
    fs.readFile(filePath, {encoding: 'utf8'}, (err, data) => {
      if(err) reject(err);
      resolve(data);
    });
  });
}

let promise1 = instance(awaitKey, readMyFileCallback);
let promise2 = instance(awaitKey, readMyFileCallback);

return Promise.all([promise1, promise2]).then(values => {
  console.log(readTimes); // 1
});
```
