# think-i18n

[![Build Status](https://travis-ci.org/thinkjs/think-i18n.svg?branch=master)](https://travis-ci.org/thinkjs/think-i18n)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-i18n/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-i18n?branch=master)
[![npm](https://img.shields.io/npm/v/think-i18n.svg?style=flat-square)](https://www.npmjs.com/package/think-i18n)

[简体中文文档](https://github.com/thinkjs/think-i18n/blob/master/README_ch_CN.md)

i18n solution in thinkjs 3.0, implement base on [Jed](https://github.com/messageformat/Jed), [Moment](https://github.com/moment/moment/) and [Numeral](https://github.com/adamwdraper/Numeral-js).

## Features
 - I18N solution cover translation, datetime and number display.
 - Support per locale custom format for datetime and number.
 - Easy to use, just defined your expect format and translation in each locale file and the library will help to apply [locale settings](#locale-settings) on time, no more annoying locale switching!
 - Easy to debug
 - Locale switch process is Customizable to suit your case.
 - moment and numeral are isolated, so you can use them for free.

## How to Use
    npm install think-i18n --save

### Configure extends.js

```js
// thinkjs config/extend.js

const createI18n = require('think-i18n');
const path = require('path');

module.exports = [
  createI18n({
    i18nFolder: path.resolve(__dirname, '../i18n'),
    localesMapping(locales) {return 'en';}

  })
];

```
[complete options](#complete-options)

### Locale Settings

Each locale settings is a javascript file. see [example](https://github.com/thinkjs/think-i18n/blob/master/i18n_example/en.js)
```js
module.exports = {
    app: think.app, // if not passed in, __ will not be auto `assign` into `think-view` instance
    localeId,
    translation,
    dateFormat, // optional
    numeralFormat, // optional
}
```

- **localeId**: The unique name of your locale.

- **dateFormat**: Will apply to moment.local(localeId, dateFormat); if empty you will get a moment instance with 'en' locale.
- **numeralFormat**: Will apply numeral.locales[localeId] = numeralFormat; if empty you will get numeral instance with 'en' locale.
- **translation**: Equivalent to [Jed](https://github.com/messageformat/Jed) locale_data, if you use .po file, jed suggest use [po2json](https://www.npmjs.com/package/po2json) which support jed format transform.



### Controller and View (nunjucks)

####  Controller

You can get i18n instance or current `locale` in controller.

```js

    async indexAction(){
      this.assign(this.i18n(/*forceLocale*/));
      ...
    }

```

####  View

If you used [think-view](https://github.com/thinkjs/think-view) ， think-i18n will auto-inject an i18n instance  into `__` field, like
`this.assign('__', this.getI18n())`.


```js

{{ __('some key') }} translation
{{ __.jed.dgettext('domain', 'some key') }} translation in specify domain
{{ __.moment().format('llll') }} datetime format
{{ __.numeral(1000).format('currency') }} number format (see numberFormat.formats)

```

### Complete Options
- **i18nFolder:string**
  Directory path where you put all [locale settings](#locale-settings) files
- **localesMapping:function(locales){return localeId;}**
  Given a list of possible locales, return a localeId
- **getLocale**
  default logic is to extract header['accept-language'] if set to falsy value.
  To get from url query locale, set to {by: 'query', name: 'locale'}.
  To get from cookie of locale, set to {by: 'cookie', name: 'locale'}
  To implement your own logic, function([ctx](https://github.com/koajs/koa/blob/master/docs/api/context.md)) {return locale;}

- **debugLocale**
  set to value of localeId

- **jedOptions**
  You can set **domain** and **missing_key_callback**, for details refer to [jed doc](http://messageformat.github.io/Jed/).

  default value is {}, the final jed options will be

``` js
   Object.assign(jedOptions, {locale_data: <your locale translation>})
```

### Some Thoughs Behine
  Why combine all there libraries' i18n config into one? the answer is for transparent but most importantly, flexibility to compose you date, number and message's behavior per locale, for example, you have a website in China and want to provide English translation, but keep the chinese currency symbol, so you can compose english translation and chinese date and currency in your en.js [locale setting](#locale-setting).
  ```javascript
  // locale setting of en.js
  module.exports = {
    localeId: 'en_ch',
    translation: require('../english.po.json'),
    dateFormat: require('../moment/en.json'),
    numeralFormat: require('../numeral/en.json')
  };
  ```

We should always use customize format.
  - use **__.moment().format('llll')**  instead of moment().format('YYYY-MM-dd HH:mm').
  - use **__.numeral(value).format('customFormat')** instead of numeral(value).format('00.00$'),


#### Notice
- locale id must be lower case.
- If you defined **en** locale, witch will override the default **en** locale in [Numeral](https://github.com/adamwdraper/Numeral-js).
- In case you also want to use moment and numeral in your system, we isolated the [Moment](https://github.com/moment/moment/) and [Numeral](https://github.com/adamwdraper/Numeral-js) by use bundledDependencies in package.json.
- [Numeral](https://github.com/adamwdraper/Numeral-js) doesn't not support per locale custom format,  this is done using some tricks and you can config each locale's customFormat in [config](https://github.com/thinkjs/think-i18n/blob/master/i18n_example/en.js).numeralFormat.formats.


