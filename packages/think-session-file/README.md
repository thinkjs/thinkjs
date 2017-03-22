# think-session-file

File session for ThinkJS

## Install

```
npm install think-session-file
```

## How to use

config file `src/config/adapter.js`, add options:

```js
const fileSession = require('think-session-file');
exports.session = {
  type: 'file',
  common: {
    cookie: {
      name: 'thinkjs',
      //maxAge: '',
      //expires: '',
      path: '/',  //a string indicating the path of the cookie
      //domain: '',
      //secure: false,
      //keys: [],
      httpOnly: true,
      sameSite: false,
      signed: false,
      overwrite: false
    }
  },
  file: {
    handle: fileSession,
    maxAge: '1d', //session timeout, default is 1 day
    autoUpdate: false, //update expires time when get session, default is false
  }
}
```
