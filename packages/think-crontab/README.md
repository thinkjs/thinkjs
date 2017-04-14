# think-crontab

crontab for ThinkJS

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