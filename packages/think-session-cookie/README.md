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
  common: {
    cookie: {
      name: 'thinkjs',
      autoUpdate: false, //auto update cookie when is set maxAge
      //maxAge: '',
      //expires: '',
      path: '/',  //a string indicating the path of the cookie
      //domain: '',
      //secure: false,
      //keys: [],
      httpOnly: true,
      sameSite: false,
      signed: false,
      overwrite: false,
      encrypt: false //encrypt cookie data
    }
  }
  cookie: {
    handle: cookie
  }
}
```
