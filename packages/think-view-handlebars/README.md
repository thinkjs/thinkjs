# think-view-handlebars
[![Build Status](https://travis-ci.org/thinkjs/think-view-handlebars.svg?branch=master)](https://travis-ci.org/thinkjs/think-view-handlebars)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-view-handlebars/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-view-handlebars?branch=master)
[![npm](https://img.shields.io/npm/v/think-view-handlebars.svg?style=flat-square)](https://www.npmjs.com/package/think-view-handlebars)

## Install

```
npm install think-view-handlebars
```


## Usage

edit config file `src/config/adapter.js`, add options:

```js
const handlebars = require('think-view-handlebars');
exports.view = {
  type: 'handlebars',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    extname: '.html',
    sep: '_' //seperator between controller and action
  },
  handlebars: {
    handle: handlebars,
    beforeRender: (handlebars, config) => {
      // todo
    }
  }
}
```

### default options

```js
const defaultOptions = {
  compat: true,
  strict: false,
  preventIndent: true,
  ignoreStandalone: true,
  cache: false
};
```

change options:

```js
exports.view = {
  type: 'handlebars',
  handlebars: {
    handle: handlebars,
    options: {
      strict: true
    },
    beforeRender: (handlebars, config) => {
      // todo
    }
  }
}
```
you can find all handlebars's support options at http://handlebarsjs.com/reference.html

### beforeRender

```js
exports.view = {
  type: 'handlebars',
  handlebars: {
    handle: handlebars,
    beforeRender: (handlebars, config) => {
      handlebars.registerHelper("studyStatus", function(passingYear) {
         if(passingYear < 2017) {
            return "passed";
         } else {
            return "not passed";
         }
      })
    }
  }
}
```
you can find all APIs at http://handlebarsjs.com/reference.html
