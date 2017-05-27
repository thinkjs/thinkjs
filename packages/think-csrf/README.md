# think-csrf
[![npm](https://img.shields.io/npm/v/think-csrf.svg)](https://www.npmjs.com/package/think-csrf)
[![Build Status](https://travis-ci.org/thinkjs/think-csrf.svg?branch=master)](https://travis-ci.org/thinkjs/think-csrf)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-csrf/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-csrf?branch=master)

CSRF for Thinkjs 3.0

## Install

```
$ npm install think-csrf --save
```

## How to use

config file `src/config/middleware.js`

```javascript
const csrf = require('think-csrf');

module.exports = [{
  handle: csrf,
  options: {
    session_name: 'csrf_token',
    form_name: '_csrf',
    header_name: 'x-csrf-token'
  }
}];
```

**Usage**

`ctx.csrf` getter for CSRF token

## Options

| Name | Description | Default | 
| :------: | :------: | :------: |
| `session_name` | csrf token's session name | `'csrf_token'` |
| `form_name` | request csrf token's name in body and query | `'_csrf'` |
| `header_name` | request csrf token's name in header | `'x-csrf-token'` |
| `errno` | error status | `403` |
| `errmsg` | error message | `'invalid csrf token'` |
