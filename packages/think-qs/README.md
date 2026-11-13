# think-qs

[![Build Status](https://travis-ci.org/thinkjs/think-qs.svg?branch=master)](https://travis-ci.org/thinkjs/think-qs)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-qs/badge.svg)](https://coveralls.io/github/thinkjs/think-qs)
[![npm](https://img.shields.io/npm/v/think-qs.svg)](https://www.npmjs.com/package/think-qs)

Use [qs](https://github.com/ljharb/qs) module to parse query & post data, support array & object value.For example, the string 'foo[bar]=baz' converts to: 

```js
foo: {
  bar: 'baz'
}
```


## Installation

```sh
npm install think-qs
```

think-qs need [thinkjs](https://github.com/thinkjs/thinkjs) version `>=3.2.2`.

## How to use

Config file `src/config/middleware.js` (in multi mode, file is `src/common/config/middleware.js`), add middleware after payload:

```js
const qs = require('think-qs');
module.exports = [
  ...
  {
    handle: 'payload'
  },
  {
    handle: qs,
    options: {

    }
  }
]
```

After config, you can get array & object value by `this.get` or `this.post` in controller.

## options

This middleware support follow options:

* `query`: true, enable use qs to parse querystring
* `post`: true, enable use qs to parse post data

You can find more options from https://github.com/ljharb/qs.

## Security

If you use this middleware, you must be careful about security. some ORM support array/object in where conditions, it may be cause SQL injections.

```js
// http://docs.sequelizejs.com/manual/tutorial/querying.html
Post.findAll({
  where: {
    id: this.get('id')
  }
});
```
In here, we want `id` is an integer, but when url is `/pathname?id[$gt]=6`, id value is an object:

```js
{
  $gt: 6
}
```

then where conditions is not we wanted, it caused SQL injection. you can config logic to resolve this security problems.

```js
module.exports = class extends think.Logic {
  indexAction() {
    this.rules = {
      id: {
        int: true
      }
    }
  }
}
```
you can get more information about logic from https://thinkjs.org/zh-cn/doc/3.0/logic.html.

## TypeScript

The CommonJS factory and `think-qs/index.js` entry remain available. TypeScript
consumers can use `import middleware = require('think-qs')` or a default import
with `esModuleInterop`. Generated declarations are checked on TypeScript 3.9.10
and 5.9.3. Runtime consumers do not need TypeScript, Node ambient types, or qs
ambient types installed.

`query` and `post` are checked boolean options. Other options are passed directly
to the installed qs parser and can use an existing interface-typed options object.
This package does not duplicate or validate the version-specific qs options API.
Parsed request values are `unknown`: custom decoders can return arbitrary values,
and HTTP input must be validated at runtime. Middleware preserves the exact return
type of `next`, including synchronous values and promises.

For maintainer build, package verification, and migration limitations, see
[the migration notes](../../docs/typescript-migration/p3-think-qs.md).
