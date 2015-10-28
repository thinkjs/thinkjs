
application created by [ThinkJS](http://www.thinkjs.org)

## install dependencies

```
npm install
```

## watch-compile

if create application with `--es6` paramter, must be compile code before start server.

```
npm run watch-compile
```

## start server

```
npm start
```

## deploy with pm2

use pm2 to deploy app on production envrioment.

```
pm2 startOrGracefulReload pm2.json
```