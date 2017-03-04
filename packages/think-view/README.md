# think-view

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
]
```

config `view` in `src/config/adapter.js`:

```js
const nunjucks = require('think-view-nunjucks');
exports.view = {
  type: 'nunjucks',
  common: {
    viewPath: '',
    extname: '.html',
    sep: '_'
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
    await this.render();
  }
}
```