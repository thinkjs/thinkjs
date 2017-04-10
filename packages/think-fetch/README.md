# think-request
[![Build Status](https://travis-ci.org/thinkjs/think-request.svg?branch=master)](https://travis-ci.org/thinkjs/think-request)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-request/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-request?branch=master)

Request for ThinkJS 3.x

## Install

```
$ npm install think-request
```

## How to use

config file `src/config/extend.js`

```javascript
const request = require('think-request');

module.exports = [
  request, // HTTP request client.
];
```

## Methods in Controller

```javascript
module.exports = class extends think.Controller {
  async indexAction(){
    this.ctx.body = await this.curl('https://api.github.com/repos/thinkjs/think-request');
  }
}
```

[More Methods Click](https://github.com/request/request-promise)