# think-csrf

[![Build Status](https://travis-ci.org/thinkjs/think-csrf.svg?branch=master)](https://travis-ci.org/thinkjs/think-csrf)

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
