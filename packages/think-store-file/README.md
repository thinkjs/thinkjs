# think-store-file
[![Build Status](https://travis-ci.org/thinkjs/think-store-file.svg?branch=master)](https://travis-ci.org/thinkjs/think-store-file)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-store-file/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-store-file?branch=master)
[![npm](https://img.shields.io/npm/v/think-store-file.svg?style=flat-square)](https://www.npmjs.com/package/think-store-file)

`think-store-file` use file to store content


## Usage


```js
import StoreFile from 'think-store-file';
let storeFileInst = new StoreFile(storePath);

let relativePath = 'abc/a.js';
await storeFileInst.set(relativePath, 'Thinkjs'); // set 'Thinkjs' as content
await storeFileInst.get(relativePath); // Thinkjs
await storeFileInst.delete(relativePath); // delete a.js

```
