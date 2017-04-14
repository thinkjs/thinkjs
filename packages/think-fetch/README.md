# think-fetch
[![npm](https://img.shields.io/npm/v/think-fetch.svg)](https://www.npmjs.com/package/think-fetch)
[![Build Status](https://travis-ci.org/thinkjs/think-fetch.svg?branch=master)](https://travis-ci.org/thinkjs/think-fetch)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-fetch/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-fetch?branch=master)

Fetch for ThinkJS 3.x

## Install

```
$ npm install think-fetch --save
```

## How to use

config file `src/config/extend.js`

```javascript
const fetch = require('think-fetch');

module.exports = [
  fetch, // HTTP request client.
];
```

## Methods in Controller

```javascript
module.exports = class extends think.Controller {
  async indexAction () {

    // plain text or html
    const text = await this.fetch('https://github.com/').then(res => res.text());

    // json
    const json = await this.fetch('https://api.github.com/repos/thinkjs/think-fetch').then(res => res.json());

    // post
    const body = await this.fetch('http://httpbin.org/post', { method: 'POST', body: 'a=1' }).then(res => res.json());

    // stream
    const res = await this.fetch('https://assets-cdn.github.com/images/modules/logos_page/Octocat.png');
    const dest = fs.createWriteStream('./octocat.png');
    res.body.pipe(dest);

    // post with stream from file
    const stream = fs.createReadStream('input.txt');
    const result = this.fetch('http://httpbin.org/post', { method: 'POST', body: stream }).then(res => res.json());
  }
}
```

## API

### fetch(url[, options])

- `url` A string representing the URL for fetching
- `options` [Options](#fetch-options) for the HTTP(S) request
- Returns: `Promise<Response>`

Perform an HTTP(S) fetch.

url should be an absolute url, such as `http://example.com/`. A path-relative URL (`/file/under/root`) or protocol-relative URL (`//can-be-http-or-https.com/`) will result in a rejected promise.

#### Options

The default values are shown after each option key.

```
{
  // These properties are part of the Fetch Standard
  method: 'GET',
  headers: {},        // request headers. format is the identical to that accepted by the Headers constructor (see below)
  body: null,         // request body. can be null, a string, a Buffer, a Blob, or a Node.js Readable stream
  redirect: 'follow', // set to `manual` to extract redirect headers, `error` to reject redirect

  // The following properties are node-fetch extensions
  follow: 20,         // maximum redirect count. 0 to not follow redirect
  timeout: 0,         // req/res timeout in ms, it resets on redirect. 0 to disable (OS limit applies)
  compress: true,     // support gzip/deflate content encoding. false to disable
  size: 0,            // maximum response body size in bytes. 0 to disable
  agent: null         // http(s).Agent instance, allows custom proxy, certificate etc.
}
```

##### Default Headers

If no values are set, the following request headers will be sent automatically:

| Header | Value |
| :------: | :------: |
| `Accept-Encoding` | `gzip,deflate` (when `options.compress === true`) |
| `Accept` | `*/*` |
| `Connection` | `close` (when no `options.agent` is present) |
| `Content-Length` | (automatically calculated, if possible) |
| `User-Agent` | `node-fetch/1.0 (+https://github.com/bitinn/node-fetch)` |



[More Methods Click](https://github.com/bitinn/node-fetch)