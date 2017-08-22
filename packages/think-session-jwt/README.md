# think-session-jwt
JsonWebToken to store session for ThinkJS 3.x base on [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

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
    secret: 'secret' // secret is reqired
    sign: {
        // sign options is not required
    },
    verify: {
        // verify options is not required
    }
}
```

### sign and verify options

使用[node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)的配置。
