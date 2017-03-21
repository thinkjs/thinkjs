# think-session

Session for ThinkJS 3.x, **it's already built in framework**

Add `session` method for controller/context.

## config

config file `src/config/adapter.js`, add options:

```js
const cookie = require('think-session-cookie');
exports.session = {
  type: 'cookie',
  cookie: {

  }
}
```

## session method

* `this.session()` get all session data
* `this.session(name)` get session data with name
* `this.session(name, value)` set session data
* `this.session(null)` delete all session data
* `this.session(name, undefined, options)` get session data with options