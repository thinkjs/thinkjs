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
    cookie: {
      secret: 'secret',  // secret is reqired
      getType: 'cookie', // ['query', 'body', 'header', 'cookie'], 'cookie' is default
      setType: 'cookie', // ['header', 'cookie'], 'cookie' is default
      getTokenName: 'jwt', // if getType not 'cookie', this will be token name, 'jwt' is default
      setTokenName: 'x-jwt-token', // if setType not 'cookie', this will be token name, 'x-jwt-token' is default
      sign: {
          // sign options is not required
      },
      verify: {
          // verify options is not required
      }
    }
}
```

### sign and verify options

使用[node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)的配置。
