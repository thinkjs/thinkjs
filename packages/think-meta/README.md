# think-meta
Show meta for ThinkJS 3.x

## Install

```
npm install think-meta
```

## How to use

config file `src/config/middleware.js`

```js
const meta = require('think-meta');
module.exports = [
  {
    handle: meta,
    options: {

    }
  }
]
```

## Support options

```js
{
  requestTimeout: 10 * 1000, //request timeout, default is 10s
  requestTimeoutCallback: () => {}, //request timeout callback
  sendPowerBy: true,  //send powerby
  sendResponseTime: true, //send response time
  logRequest: true //log request
}
```