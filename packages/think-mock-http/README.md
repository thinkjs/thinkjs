# think-mock-http
[![Build Status](https://travis-ci.org/thinkjs/think-mock-http.svg?branch=master)](https://travis-ci.org/thinkjs/think-mock-http)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-mock-http/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-mock-http?branch=master)
[![npm](https://img.shields.io/npm/v/think-mock-http.svg?style=flat-square)](https://www.npmjs.com/package/think-mock-http)

Mock http for ThinkJS

## TypeScript

The package includes CommonJS-compatible declarations. Install Node declarations
compatible with your project's TypeScript version (`@types/node`).

```ts
import mockHttp = require('think-mock-http');

const {req, res} = mockHttp({url: '/example', method: 'GET'});
res.setHeader('x-example', req.url || '');
```

Object arguments without `req`/`res` injection expose Node request/response types
with the request-property overrides applied. Strings may contain JSON with
injected values, and injected requests are shallow plain-object copies, so these
forms return a request property bag and an `unknown` response that need narrowing.
Application callbacks retain their exact return type; annotate the handler's
request/response parameters when using the dynamic string/injection forms.
