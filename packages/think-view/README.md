# think-view
[![Build Status](https://travis-ci.org/thinkjs/think-view.svg?branch=master)](https://travis-ci.org/thinkjs/think-view)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-view/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-view?branch=master)
[![npm](https://img.shields.io/npm/v/think-view.svg?style=flat-square)](https://www.npmjs.com/package/think-view)

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
    this.assign({ //assign multi variable
      title: 'thinkjs',
      name: 'thinkjs doc'
    })
  }
}
```

### render

render file

```js
module.exports = class extends think.Controller {
  async indexAction(){
    //render file index_index.html
    const content1 = await this.render();
    const content2 = await this.render('doc'); //render doc.html
    const content3 = await this.render('doc', 'ejs'); //change view render type to ejs
    const content4 = await this.render('doc', {type: 'ejs', xxx: 'yyy'}); //add other properties
  }
}
```

### display

display view file

```js
module.exports = class extends think.Controller {
  indexAction(){
    //render file index_index.html
    return this.display();
  }
}
```
