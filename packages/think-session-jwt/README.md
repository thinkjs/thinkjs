# think-session-jwt
JsonWebToken to store session for ThinkJS 3.x base on [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

[![Build Status](https://travis-ci.org/thinkjs/think-session-jwt.svg?branch=master)](https://travis-ci.org/thinkjs/think-session-jwt)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-session-jwt/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-session-jwt?branch=master)
[![npm version](https://badge.fury.io/js/think-session-jwt.svg)](https://badge.fury.io/js/think-session-jwt)

## Install

```bash
npm install think-session-jwt --save
```

## Quick Start

```js
const JWTSession = require('think-session-jwt');

exports.session = {
  type: 'jwt',
  common: {
    cookie: {
      name: 'thinkjs',
    }
  },
  jwt: {
    handle: JWTSession,
    secret: 'secret',  // secret is reqired
    tokenType: 'cookie', // ['query', 'body', 'header', 'cookie'], 'cookie' is default
    tokenName: 'jwt', // if tokenType not 'cookie', this will be token name, 'jwt' is default
    sign: {
        // sign options is not required
    },
    verify: {
        // verify options is not required
    }
}
```

1. session数据从token中获取，通过配置tokenType指定token获取方式。
2. 设置session数据后会返回token字符串。

### Debug
```bash
DEBUG=think-session-jwt

# windows
set DEBUG=think-session-jwt

# powershell
$env:DEBUG="think-session-jwt"

```

### Sign and verify options

使用[node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)的配置。
