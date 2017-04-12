# think-resource
Resource for ThinkJS 3.x

[![Build Status](https://travis-ci.org/thinkjs/think-resource.svg?branch=master)](https://travis-ci.org/thinkjs/think-resource)

think-resource is an static-file handler for Thinkjs 3.x. 

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
        root: '.'
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

## Contributing

Contributions welcome!

## License

[Mit](https://github.com/thinkjs/think-resource/blob/master/LICENSE)