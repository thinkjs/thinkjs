# think-view
[![Build Status](https://travis-ci.org/thinkjs/think-view.svg?branch=master)](https://travis-ci.org/thinkjs/think-view)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-view/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-view?branch=master)
[![npm](https://img.shields.io/badge/npm-1.0.2-blue.svg)](https://www.npmjs.com/package/think-view)

## Install

```
npm install think-view
```

## How to use

config file `src/config/extend.js`:

```js
const view = require('think-view');
module.exports = [
  view
];
```

config `view` in `src/config/adapter.js`:

```js
const nunjucks = require('think-view-nunjucks');
const path = require('path');
exports.view = {
  type: 'nunjucks',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    extname: '.html',
    sep: '_' //seperator between controller and action
  },
  nunjucks: {
    handle: nunjucks
  }
}
```

then can use some methods in controller

## methods in controller

### assign

assign variable to view

```js
module.exports = class extends think.Controller {
  indexAction(){
    this.assign('title', 'ThinkJS Application');
  }
}
```

### render

render file

```js
module.exports = class extends think.Controller {
  async indexAction(){
    //render file index_index.html
    let content = await this.render();
  }
}
```

### display

display view file

```js
module.exports = class extends think.Controller {
  async indexAction(){
    //render file index_index.html
    await this.display();
  }
}
```