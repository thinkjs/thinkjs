# think-ratelimiter
ThinkJS ratelimit middlewate

## Install

`yarn add think-ratelimiter` or `npm install think-ratelimiter`

## How to use
```js
// in middleware.js

const redis = require('redis');
const { port, host, password } = think.config('redis');
const db = redis.createClient(port, host, { password });

{
    handle: ratelimit,
    options: {
      db,
      errorMessage: 'Sometimes You Just Have To Slow Down',
      headers: {
        remaining: 'Rate-Limit-Remaining',
        reset: 'Rate-Limit-Reset',
        total: 'Rate-Limit-Total'
      },
      actions: {
        'test/test': {
          id: ctx => ctx.ip,
          max: 5,
          duration: 7000 // ms
        }
      }
    }
  },
```