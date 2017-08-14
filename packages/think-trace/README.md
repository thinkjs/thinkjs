# think-trace

[![npm](https://img.shields.io/npm/v/think-trace.svg?style=flat-square)]()
[![Travis](https://img.shields.io/travis/thinkjs/think-trace.svg?style=flat-square)]()
[![Coveralls](https://img.shields.io/coveralls/thinkjs/think-trace/master.svg?style=flat-square)]()
[![David](https://img.shields.io/david/thinkjs/think-trace.svg?style=flat-square)]()

think-trace is an error handler for ThinkJS 3.x and koa2. It provides a pretty error web interface that helps you debug your web project.

![](https://p1.ssl.qhimg.com/t0105986ac7dfc1c197.png)

## Installation

```
npm install think-trace
```

## How To Use


### Koa2

```js
const traceMiddleware = require('think-trace');
app.use(traceMiddleware({
  sourceMap: false,
  error: err => console.error(err)
}));
```

### ThinkJS3.x

Modify `src/config/middleware.js`:

```js
const trace = require('think-trace');

module.exports = [
  {
    handle: trace, 
    options: {
      sourceMap: false,
      error(err, ctx) {
        return console.error(err);
      }
    }
  }
];
```

## Options

- `sourceMap`: Whether your project has source map support, default is `true`.
- `debug`: Whether show error detail in web, default is `true`. 
- `ctxLineNumbers`: How long you want show error line context, default is `10`.
- `contentType`: Due to think-trace can't get content-type while application throw error, you should set content type by yourself by this parameter. Default value is `ctx => 'html';`. You can set json content type like this:
    ```js
    {
      contentType(ctx) {
        // All request url starts of /api or request header contains `X-Requested-With: XMLHttpRequest` will output json error
        const APIRequest = /^\/api/.test(ctx.request.path);
        const AJAXRequest = ctx.is('X-Requested-With', 'XMLHttpRequest');
        
        return APIRequest || AJAXRequest ? 'json' : 'html';
      }
    }
    ```
- `error`: callback function when catch error, it receives Error object  and ctx as parameter.
- `templates`: error status template path, if you want to specific. You can set `templates` as a path string, then module will read all status file named like `404.html`, `502.html` as your customed status page. Or you can set `templates` as an object, for example:
    ```js
    {
      options: {
        //basic set as string, then put 404.html, 500.html into error folder
        templates: path.join(__dirname, 'error'),

        //customed set as object
        templates: {
          404: path.join(__dirname, 'error/404.html'),
          500: path.join(__dirname, 'error/500.html'),
          502: path.join(__dirname, 'error/502.html')
        }
      }
    }
    ```

## Contributing

Contributions welcome!

## License

[MIT](https://github.com/thinkjs/think-trace/blob/master/LICENSE)
