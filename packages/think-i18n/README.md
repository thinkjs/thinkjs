# think-i18n
[简体中文文档](https://github.com/thinkjs/think-i18n/blob/master/README_ch_CN.md)

i18n solution in thinkjs 3.0, implement base on [Jed](https://github.com/messageformat/Jed), [Moment](https://github.com/moment/moment/) and [Numeral](https://github.com/adamwdraper/Numeral-js).

## Features
 - I18N solution cover translation, datetime and number display.
 - Support per locale custom format for datetime and number.
 - Easy to use, just defined your expect format and translation in each locale file and the library will help to apply locale settings on time, no more annoying locale switching!
 - Easy to debug
 - Locale switch process is Customizable to suit your case.
 - moment and numeral are isolated, so you can use them as expected.

## How to use
    npm install think-i18n --save
### Configure extends.js

```js
// thinkjs config/extend.js

const createI18n = require('think-i18n');
const path = require('path');

var regCn = /^cn.*$/;
var regEn = /^en.*$/;

module.exports = [
  createI18n({
    i18nFolder: path.resolve(__dirname, '../i18n'),
    defaultLocale: 'cn',
    // getLocale: default logic is to extract header['accept-language'] is not specified
    // getLocale: {by: 'query', name: 'locale'}
    // getLocale: {by: 'cookie', name: 'locale'}
    // getLocale: function(ctx) { <!-- implement your own getLocale logic --> }
    localesMapping(locales) {
      for(l of locales) {
        if(l.match(regCn)) {
          return 'cn';
        }
        if(l.match(regEn)) {
          return 'en';
        }
      }
      // default
      return 'cn';
    },
    // debugLocale: 'cn'
  })
];

```
### Provide locale settings

- **dateFormat** will apply to moment.local(localeId, dateFormat); if empty you will get a moment instance with 'en' locale.
- **numeralFormat** will apply numeral.locales[localeId] = numeralFormat; if empty you will get numeral instance with 'en' locale.
- **translation** is equivalent to [Jed](https://github.com/messageformat/Jed) locale_data, if you use .po file, jed suggest use [po2json](https://www.npmjs.com/package/po2json) which support jed format transform.


```

### Controller and View (nunjucks)

####  in controller

    async indexAction(){
      this.assign(this.i18n(/*forceLocale*/));
      ...
    }

####  in view

```js

{{ jed.gettext('some key') }} translation
{{ jed.dgettext('domain', 'some key') }} translation in specify domain
{{ moment().format('llll') }} datetime format
{{ numeral(1000).format('currency') }} number format (see numberFormat.formats)

```

### Why not use moment bundled i18n configure
  For transparent but most importantly, flexibility to compose you date, number and message's localization per locale, for example, you have a website in China and want to provide English translation, but keep the chinese currency symbol, so you can configure the en.js file to use.

### Notice
If you defined **en** locale, witch will override the default **en** locale in [Numeral](https://github.com/adamwdraper/Numeral-js).

## Debug a locale

  By default, getLocal read value from header['accept-language'] ，and then pass through localesMapping . But if you just want to test a locale, just set **debugLocal** to that locale.

## Best Pratice

### use customize format

  - Always use **moment().format('llll')**  instead of moment().format('YYYY-MM-dd HH:mm').
  - Always use **numeral(value).format('customFormat')** instead of numeral(value).format('00.00$'), [Numeral](https://github.com/adamwdraper/Numeral-js) doesn't not support per locale custom format,  this is done using some tricks and you can config each locale's customFormat's in locale.numeralFormat.formats.