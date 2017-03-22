# think-trace

think-trace is an error handler for thinkjs3.x and koa2. It provides a pretty error web interface that helps you debug your web project.

## Installation

```
npm install think-trace
```

## How To Use


### Koa2

```js
const traceMiddleware = require('think-trace');
app.use(traceMiddleware({
  sourceMap: false
}));
```

### ThinkJS3.x

Modify `src/config/middleware.js`:

```js
const trace = require('think-trace');

module.exports = [
  {handle: trace, options: {}}
];
```

## Options

- `sourceMap`: Whether your project has source map support, default is `true`.
- `debug`: Whether show error detail in web, default is `true`. 
- `ctxLineNumbers`: How long you want show error line context, default is `10`.
- `err404Template`: 404 error template path, if you want to specific.
- `err500Template`: 500 error template path, if you want to specific.

## Contributing

Contributions welcome!

## License

[MIT](https://github.com/thinkjs/think-trace/blob/master/LICENSE)
