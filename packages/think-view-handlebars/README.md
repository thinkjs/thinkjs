# think-view-nunjucks
[![Build Status](https://travis-ci.org/thinkjs/think-view-nunjucks.svg?branch=master)](https://travis-ci.org/thinkjs/think-view-nunjucks)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-view-nunjucks/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-view-nunjucks?branch=master)
[![npm](https://img.shields.io/npm/v/think-view-nunjucks.svg?style=flat-square)](https://www.npmjs.com/package/think-view-nunjucks)

## Syntax

```js
import Nunjucks from 'think-view-nunjucks';

let nunjucks = new Nunjucks(templateFile, viewData, config);
let ret = await nunjucks.run();

```

- `templateFile`  {String} the file source path.
- `viewData`      {Object} the data need to render to the file.
- `config`        {Object} nunjucks render options, `viewPath` is required , `defaultOptions = {autoescape: true, watch: false, noCache: false, throwOnUndefined: false}`;
- return {Promise}


## Usage

```js
import Nunjucks from '../index.js';
let nunjucks = new Nunjucks('./admin.njk', {title: 'thinkjs'}, {
  viewPath: path.join(__dirname, 'views'),
  beforeRender: function(config, nunjucks, env) {
    env.addFilter('shorten', function(str) {
      return str.slice(0, 5);
    });
  }
});
let ret = await nunjucks.run();

```
