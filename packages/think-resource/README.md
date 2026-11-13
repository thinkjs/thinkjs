# think-resource
Resource for ThinkJS 3.x

[![npm](https://img.shields.io/npm/v/think-resource.svg)](https://www.npmjs.com/package/think-resource)
[![Build Status](https://travis-ci.org/thinkjs/think-resource.svg?branch=master)](https://travis-ci.org/thinkjs/think-resource)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-resource/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-resource?branch=master)

think-resource is an static-file handler for ThinkJS 3.x. 

## Installation

```
$  npm install think-resource
```

## 

## API

Modify `src/config/middleware.js`

```js
const resource = require('think-resource')

module.exports = [
  { 
      handle: resource,
      options: {
           root: '.',
           publicPath: '/static',
           index: 'index.html',
           hidden: false,
           format: true,
           gzip: false,
           extensions: ['.txt'],
           maxage: 0,
           setHeaders: function(res, path, stats) {
              ...
           },
           notFoundNext: false
      }
  }
]
```

### Options

- `root`:  Root directory to restrict file access， `require`.
- `index`: Default file name, default is `index.html`.
- `hidden`: Allow transfer of hidden files. default is `false`.
- `format`:  If not false (defaults to true), format the path to serve static file servers and not require a trailing slash for directories, so that you can do both /directory and /directory/, default is `false`.
- `gzip`: Try to serve the gzipped version of a file automatically when gzip is supported by a client and if the requested file with .gz extension exists. default is `false`.
- `extensions`: Try to match extensions from passed array to search for file when no extension is sufficed in URL. First found is served. default is `false`.
- `maxage`: Function to set custom headers on response. Browser cache max-age in milliseconds, default is `0`.
- `publicPath`: Public path for route-match. default is `/`.
- `setHeaders`: Function to set custom headers on response. default is `false`. usage: `setHeaders: function(res, path, stats){}`
- `notFoundNext`: If it can't find target file, will continue excuting `next` function.  default is `false`.

## Contributing

Contributions welcome!

## License

[Mit](https://github.com/thinkjs/think-resource/blob/master/LICENSE)

## TypeScript and package development

The package ships compiled CommonJS and generated declarations. `require('think-resource')`
and `require('think-resource/index.js')` retain the same function export. JavaScript
consumers do not need TypeScript or a build step. There is no `exports` restriction.

```ts
import resource = require('think-resource');

const middleware = resource({
  root: './www',
  publicPath: '/static',
  notFoundNext: true,
  setHeaders(response, filename, stats) {
    response.setHeader('Last-Modified', stats.mtime.toUTCString());
    response.setHeader('X-Static-File', filename);
  }
});
```

`publicPath` controls matching; it is not removed from the requested file path.
A matching GET/HEAD uses the existing `koa-send` promise and discards its filename
result. Missing files call `next` only when `notFoundNext` is enabled. Nonmatching
requests return `next()` unchanged, including synchronous values. A served response
can therefore resolve to `undefined` even when downstream returns another type.

The declaration uses a structural Koa context and a small Node response/Stats surface,
so consumers need no ambient Node types merely to import this package. The header
hook intentionally uses method bivariance to also accept callbacks explicitly typed
with Node's `ServerResponse` and `Stats`; additional custom properties are not
promised. The promise type unwraps one level, compatible with TypeScript 3.9's
promise model; exotic recursively nested custom thenables are not modeled exactly.
The declarations are checked on TypeScript 3.9.10 and 5.9.3; this is this package's
consumer baseline, not a framework-wide TypeScript version guarantee.

Maintainers install the workspace dependencies with Node 24 and pinned pnpm, then run:

```sh
pnpm --filter think-resource build
pnpm --filter think-resource typecheck
pnpm --filter think-resource test
pnpm --filter think-resource clean
```

The runtime minimum remains Node 20.19.0. The maintainer compiler is pinned at the
workspace root, and current Node declarations are a build-only dependency. `prepack`
forces compilation so missing outputs are restored and semantic errors refuse a
package even when stale output exists. `clean` removes configured compiler outputs,
not arbitrary stale or user-created files. The package includes both map formats and
their TypeScript source targets. No registry publication is performed by these tests.
