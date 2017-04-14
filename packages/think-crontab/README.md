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

* `interval` 
* `cron`
* `worker`
* `handle`
* `immediate`