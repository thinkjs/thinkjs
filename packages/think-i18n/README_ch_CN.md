# think-i18n
[English Document](https://github.com/thinkjs/think-i18n)

thinkjs 3.0 国际化方案, 基于 [Jed](https://github.com/messageformat/Jed), [Moment](https://github.com/moment/moment/) 和 [Numeral](https://github.com/adamwdraper/Numeral-js).

## 特性
 - 涵盖了翻译，日期显示和数字、货币显示。
 - 支持给每个 locale 配置自定义的日期和数字格式。
 - 简单易用，只需要定义好每个 locale 的行为，插件会在合适的时间应用配置，再也不需要手工繁琐的切换各个类库的 locale 。
 - 方便调试不同 locale。
 - 可以定制方案的各个步骤行为。
 - moment 和 numberal 的 i18n 行为会被隔离，这样你可以在系统其它地方按照期望的方式使用这两个类库。

## 安装
    npm install think-i18n --save
### 配置 extends.js

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
    // getLocale: function(ctx) { <!-- implement your getLocale logic --> }
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
### 配置 locale 文件

 每个 locale 一个文件，放在 i18nFolter 目录下。

- **dateFormat** 会应用到 moment.local(localeId, dateFormat); 如果不提供配置，默认使用 en
- **numeralFormat** 会应用到 numeral.locales[localeId] = numeralFormat; 如果不提供配置，默认使用 cn
- **translation** 相当于 [Jed](https://github.com/messageformat/Jed) 里面的 locale_data, 如果你是使用 po 文件管理翻译，jed 推荐使用 [po2json](https://www.npmjs.com/package/po2json)。

[查看配置详情](https://github.com/thinkjs/think-i18n/blob/master/i18n_example/en.js)

```

### Controller 和 View (nunjucks)

####  controller

    async indexAction(){
      this.assign(this.i18n(/*forceLocale*/));
      ...
    }

####  view

```js

{{ jed.gettext('some key') }} 翻译
{{ jed.dgettext('domain', 'some key') }} 带domain翻译
{{ moment().format('llll') }} 时间格式
{{ numeral(1000).format('currency') }} 数字格式 (参考配置 numberFormat.formats)

```

### 为什么不使用 Moment 自带的 i18n 文件

为的是配置的透明和可控制性，可以灵活的组合在某一个 locale 下，分别使用的 语言翻译，时间格式和数字格式。比如有一个在中国的购物网站，希望提供英文的翻译方便老外使用，但是货币数字和时间的格式仍然使用中国的标准。

### 注
如果定义了 **en** locale， 会覆盖 [Numeral](https://github.com/adamwdraper/Numeral-js) 默认的配置。

## 调试某个 locale
  默认情况下，是通过读取 header['accept-language'] 的值，然后通过 localesMapping 转换后作为某一时刻采纳的 locale。如果需要调试，在 view 配置里面设置 **debugLocal** = <locale>

## 最佳实践

### 使用自定义格式

总是使用自定义的格式，这样就可以通过配置定制不用locale下有不同的输出格式。同时也方便后期的维护，比如某天我们需要把所有长日期显示修改格式，不用到每个文件里面取修改，只需要改配置就好，相当于一层抽象。

  - 使用 **moment().format('llll')** 而不是 moment().format('YYYY-MM-dd HH:mm').
  - 使用 **numeral(value).format('customFormat')** 而不是 numeral(value).format('00.00$'), [Numeral](https://github.com/adamwdraper/Numeral-js) 是不支持对每个 locale 自定义格式的，类库里面通过额外的代码支持了这个功能（具体可以看源码），配置方式参考 locale.numeralFormat.formats。