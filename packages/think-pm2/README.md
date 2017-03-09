# think-pm2

PM2 detect for ThinkJS

## Install

```
npm install think-pm2
```

## How to use

```js
const pm2 = require('think-pm2');
//use pm2 to manage node process
const inPM2 = pm2.inPM2; 
//set "exec_mode" = "cluster" in pm2 config
const isClusterMode = pm2.isClusterMode; 
```