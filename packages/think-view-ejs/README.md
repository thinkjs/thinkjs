# think-view-ejs
[![Build Status](https://img.shields.io/travis/thinkjs/think-view-ejs/master.svg?style=flat-square)](https://travis-ci.org/thinkjs/think-view-ejs)
[![Coverage Status](https://img.shields.io/coveralls/thinkjs/think-view-ejs/master.svg?style=flat-square)](https://coveralls.io/github/thinkjs/think-view-ejs?branch=master)
[![npm](https://img.shields.io/npm/v/think-view-ejs.svg?colorB=brightgreen&style=flat-square)](https://www.npmjs.com/package/think-view-ejs)


Compile view templates with EJS for ThinkJS 3.x.


## Install

```
npm install think-view-ejs
```
## Usage

edit config file `src/config/adapter.js`, add options for ejs adapter:

```js
const ejs = require('think-view-ejs');
exports.view = {
  type: 'ejs',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    extname: '.html',
    sep: '_' //seperator between controller and action
  },
  ejs: {
    //options
    handle: ejs,
    beforeRender: (ejs, config) => {
      //do something before render the template.
    }
  }
}
```



### Options

Default options:

```js
const defaultOptions = {
  cache: true
}
```

You can override it and add other options by editing file  `src/config/adapter.js` :

````js
exports.view = {
  type: 'ejs',
  ejs: {
    //override `cache` option
    cache: false,
    handle: ejs,
    beforeRender: (ejs, config) => {
      //do something before render the template.
    }
  }
}
````

Please refer to [https://github.com/mde/ejs#options](https://github.com/mde/ejs#options) for more information on EJS options.

### beforeRender

`beforeRender`  is a function that you can handle something before rendering the template file. It exposes 2 parameters:

*  `ejs` — the original `ejs` module
* `config` — current configure of ejs adapter

