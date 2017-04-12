# think-fetch
[![Build Status](https://travis-ci.org/thinkjs/think-fetch.svg?branch=master)](https://travis-ci.org/thinkjs/think-fetch)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-fetch/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-fetch?branch=master)

Fetch for ThinkJS 3.x

## Install

```
$ npm install think-fetch
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
  }
}
```

[More Methods Click](https://github.com/bitinn/node-fetch)