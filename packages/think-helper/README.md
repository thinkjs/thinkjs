# think-helper
[![Build Status](https://travis-ci.org/thinkjs/think-helper.svg?branch=master)](https://travis-ci.org/thinkjs/think-helper)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-helper/badge.svg)](https://coveralls.io/github/thinkjs/think-helper)
[![npm](https://img.shields.io/npm/v/think-helper.svg)](https://www.npmjs.com/package/think-helper)

`think-helper` defines a set of helper functions for ThinkJS.

## Installation

Using npm:

```sh
npm install think-helper
```

In Node.js:

```js
import helper from 'think-helper';

let md5 = helper.md5('');

```

APIs:

API | Param | Description
---|---|---
`isInt` |  | check integer
`isIP` |  | check IP
`isIPv4`   |  | check IPv4
`isIPv6`   |  | check IPv6
`isMaster`   | |cluster.isMaster
`isArray`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an Array
`isBoolean`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an Boolean
`isNull`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an null
`isNullOrUndefined`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is null or undefined
`isNumber`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an Number
`isString`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an String
`isSymbol`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an Symbol
`isUndefined`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an undefined
`isRegExp`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an RegExp
`isObject`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an Object
`isDate`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an Date
`isError`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an Error
`isFunction`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an Function
`isPrimitive`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an Primitive
`isBuffer`   | `arg`{mix}<br>`return`{Boolean} | check if a variable is an Buffer
`promisify`   |  `function`{function}<br>`receiver`{object}<br>`return` Promise  | make callback function to promise
`extend`   | `target`{object\|array}<br> `args`{Object\|Array}<br>`return`{Object} | extend object
`camelCase`   | `str`{string}<br>`return`{String} | make indexAction to index_action
`isNumberString`   | `str`{string} <br> `return`{Boolean} | check object is number string
`isTrueEmpty`   | `obj`{mixed} <br> `return`{Boolean}| truely
`isEmpty`   | `obj`{object}  <br> `return`{Boolean}| check object is mepty
`defer`   | `return` defer | get deferred object
`md5`   | `str`{string} <br> `return`{string} | get content md5
`timeout`   | `time`{Number} <br> `return` Promise | get timeout Promise
`escapeHtml`   | `str`{String}<br> `return` {string} | escape html
`datetime`   | `date`{Date\|String}<br>`format`{String}<br>`return`{String} | get datetime
`uuid`   | `version`{String} v1 or v4 | generate uuid
`isExist`   | `dir`{String} | check path is exist
`isFile`   | `filePath`{String} | check filepath is file
`isDirectory`   | `filePath`{String}  | check path is directory
`chmod`   | `path`{String}<br> `mode`{String}  | change path mode
`mkdir`   | `dir`{String}<br> `mode`{String} | make dir
`getdirFiles`   | `dir`{String}<br> `prefix`{String} | get files in path
`rmdir`   | `path`{String}<br> `reserve`{Boolean}<br>`return`{Promise} | remove dir async
`parseAdapterConfig` | `config`{Object}<br> `extConfig`{Object\|String} | parse adapter config
`ms` | `time`{String} | transform humanize time to ms
`omit` | `obj`{obj} <br> `prop` {String|Array} | omit object props


