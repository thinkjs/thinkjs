# think-helmet

[![npm](https://img.shields.io/npm/v/think-helmet.svg?style=flat-square)]()
[![Travis](https://img.shields.io/travis/thinkjs/think-helmet.svg?style=flat-square)]()
[![Coveralls](https://img.shields.io/coveralls/thinkjs/think-helmet/master.svg?style=flat-square)]()
[![David](https://img.shields.io/david/thinkjs/think-helmet.svg?style=flat-square)]()

think-helmet is a wrapper for [helmet](https://github.com/helmetjs/helmet) to work with ThinkJS 3.x. It provides important security headers to make your app more secure by default.

## Installation

```
npm install think-helmet --save
```

## Usage

```js
// src/config/middleware.js
module.exports = [{
  handle: require('think-helmet'),
  options: {

  }
}]
```

Helmet offers 11 security headers:

| Module | Default? |
|---|---|
| [contentSecurityPolicy](https://helmetjs.github.io/docs/csp/) for setting Content Security Policy |  |
| [dnsPrefetchControl](https://helmetjs.github.io/docs/dns-prefetch-control) controls browser DNS prefetching | ✓ |
| [frameguard](https://helmetjs.github.io/docs/frameguard/) to prevent clickjacking | ✓ |
| [hidePoweredBy](https://helmetjs.github.io/docs/hide-powered-by) to remove the X-Powered-By header | ✓ |
| [hpkp](https://helmetjs.github.io/docs/hpkp/) for HTTP Public Key Pinning |  |
| [hsts](https://helmetjs.github.io/docs/hsts/) for HTTP Strict Transport Security | ✓ |
| [ieNoOpen](https://helmetjs.github.io/docs/ienoopen) sets X-Download-Options for IE8+ | ✓ |
| [noCache](https://helmetjs.github.io/docs/nocache/) to disable client-side caching |  |
| [noSniff](https://helmetjs.github.io/docs/dont-sniff-mimetype) to keep clients from sniffing the MIME type | ✓ |
| [referrerPolicy](https://helmetjs.github.io/docs/referrer-policy) to hide the Referer header |  |
| [xssFilter](https://helmetjs.github.io/docs/xss-filter) adds some small XSS protections | ✓ |

You can see more in [the documentation](https://helmetjs.github.io/docs/).

Note:
-----

In order to work well with the helmet HSTS module, think-helmet will augment
`this.request` to include a `secure` boolean to determine if the request
is over HTTPS.

## Examples

```js
// src/config/middleware.js
module.exports = [{
  handle: require('think-helmet'),
  options: {
    contentSecurityPolicy: { // set content security policy directives
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com']
      }
    },
    dnsPrefetchControl: false // disable dns prefetch control
  }
}]
```