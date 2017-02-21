# think-babel
[![Build Status](https://travis-ci.org/thinkjs/think-babel.svg?branch=master)](https://travis-ci.org/thinkjs/think-babel)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-babel/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-babel?branch=master)
[![npm](https://img.shields.io/badge/npm-1.0.0-blue.svg)](https://www.npmjs.com/package/think-babel)

`think-babel` transpile ES6+ file to ES5

## Syntax

```js
import thinkBabel from 'think-babel';
thinkBabel({
  srcPath,
  outPath,
  file,
  babelOptions,
  ext,
});

```

- `srcPath`      {String} the file source path.
- `outPath`      {String} the directory for output file.
- `file`         {String} the file path in the 'srcPath'.
- `babelOptions` {Object} the babel options.
- [`ext`]        {String} the new file extension,default `.js`

## Usage

Transform a ES6+ file to ES5:

```js
import thinkBabel from 'think-babel';

thinkBabel({
  srcPath: './test/src/a',
  outPath: './test/out',
  file: 'b/test.es',
  babelOptions: {
    presets: ['es2015'],
    sourceMaps: true
  }
});

```
