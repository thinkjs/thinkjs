# think-view-handlebars
[![Build Status](https://travis-ci.org/thinkjs/think-view-handlebars.svg?branch=master)](https://travis-ci.org/thinkjs/think-view-handlebars)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-view-handlebars/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-view-handlebars?branch=master)
[![npm](https://img.shields.io/npm/v/think-view-handlebars.svg?style=flat-square)](https://www.npmjs.com/package/think-view-handlebars)

## Install

```
npm install think-view-handlebars
```


## How to Usage

edit config file `src/config/adapter.js`, add options:

```js
const handlebars = require('think-view-handlebars');
exports.view = {
  type: 'handlebars',
  handlebars: {
    handle: handlebars,
    beforeRender: (handlebars, config) => {}
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
};
```

change options:

```js
exports.view = {
  type: 'handlebars',
  handlebars: {
    handle: handlebars,
    strict: true,
    beforeRender: (handlebars, config) => {}
  }
}
```
you can find all handlebars support options by http://handlebarsjs.com/reference.html

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
you can find all APIs in http://handlebarsjs.com/reference.html
