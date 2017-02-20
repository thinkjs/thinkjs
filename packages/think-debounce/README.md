# think-await
[![Build Status](https://travis-ci.org/thinkjs/think-await.svg?branch=master)](https://travis-ci.org/thinkjs/think-await)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-await/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-await?branch=master)
[![npm](https://img.shields.io/badge/npm-3.8.6-blue.svg)](https://www.npmjs.com/package/think-await)

`think-await` runs a time-consuming operation. The operation may be called several times concurrently, but within `think-await`, it will only be run once before it's finished.

In particular, You can use `think-await` to avoid duplicate requests for a remote API.

## Syntax

```
import thinkAwait from 'think-await';
thinkAwait(key, callback)
```

- `key` {String} the identity of the operation.
- `callback` {Function} the function which contains the operation and returns a Promise object.
- return {Object} a Promise object.

## Usage

Take reading a local file for an example:

```js
import thinkAwait from 'think-await';
import fs from 'fs';

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

let promise1 = thinkAwait(awaitKey, readMyFileCallback);
let promise2 = thinkAwait(awaitKey, readMyFileCallback);

return Promise.all([promise1, promise2]).then(values => {
  console.log(readTimes); // 1
});
```
