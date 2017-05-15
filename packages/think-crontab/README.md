# think-crontab
[![Build Status](https://travis-ci.org/thinkjs/think-crontab.svg?branch=master)](https://travis-ci.org/thinkjs/think-crontab)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-crontab/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-crontab?branch=master)
[![npm](https://img.shields.io/npm/v/think-crontab.svg?style=flat-square)](https://www.npmjs.com/package/think-crontab)


## How to use

`src/config/crontab.js`,

```js
module.exports = [{
  interval: '10s',
  immediate: true,
  handle: () => {
    //do something
  }
}, {
  cron: '0 */1 * * *',
  handle: 'crontab/test',
  worker: 'all'
}]
```

### options

* `interval` {String|Number} interval task
* `cron` {String} cron task
* `worker` {String} task type, *one*/*all*, default is one
* `handle` {Function|String} task handle, required
* `immediate` {Boolean} immediate to run task, default is false
* `enable` {Boolean} enable task, default is true