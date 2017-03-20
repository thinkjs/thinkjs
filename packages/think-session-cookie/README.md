# think-session-cookie

Use cookie to store session

## Install

```
npm install think-session-cookie
```

## How to use

config file `src/config/adapter.js`, add options:

```js
const cookie = require('think-session-cookie');
exports.session = {
  type: 'cookie',
  cookie: {
    handle: cookie,
    cookie: {
      name: 'thinkjs',
      keys: ['thinkjs-key1', 'thinkjs-key2'],
      encrypt: true
    }
  }
}
```
