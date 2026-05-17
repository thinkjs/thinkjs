# think-ratelimiter
ThinkJS ratelimit middlewate

## Why use this middleware ?

To protect your applications from Brute Force Request.


## Install

`npm install think-ratelimiter`

## How to use
```js
// in middleware.js

const redis = require('redis');
const { port, host, password } = think.config('redis');
const db = redis.createClient(port, host, { password });
const ratelimiter = require('think-ratelimiter');

module.exports = {
  // after router middleware
  {
    handle: ratelimit,
    options: {
      db,
      errorMessage: 'Sometimes You Just Have To Slow Down',
      headers: {
        remaining: 'X-RateLimit-Remaining',
        reset: 'X-RateLimit-Reset',
        total: 'X-RateLimit-Limit'
      },
      resources: {
        'test/test': {
          id: ctx => ctx.ip,
          max: 5,
          duration: 7000 // ms
        }
      }
    }
  },
}

```

## Attention

* `X-Ratelimit-Reset` is Unix timestamp (Epoch seconds).
* When users exceed the access limit HTTP response status will be `429 Too Many Request`.