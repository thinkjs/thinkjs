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

module.exports = [
  createI18n({
    i18nFolder: path.resolve(__dirname, '../i18n'),
    localesMapping(locales) {return 'en';}

  })
];

```
[查看完整配置](#完整配置)

### 配置 locale 文件

 每个 locale 一个文件，放在 i18nFolter 目录下。

- **dateFormat** 会应用到 moment.local(localeId, dateFormat); 如果不提供配置，默认使用 en
- **numeralFormat** 会应用到 numeral.locales[localeId] = numeralFormat; 如果不提供配置，默认使用 cn
- **translation** 相当于 [Jed](https://github.com/messageformat/Jed) 里面的 locale_data, 如果你是使用 po 文件管理翻译，jed 推荐使用 [po2json](https://www.npmjs.com/package/po2json)。

[查看配置详情](https://github.com/thinkjs/think-i18n/blob/master/i18n_example/en.js)


### Controller 和 View (nunjucks)

####  controller

    async indexAction(){
      this.assign(this.i18n(/*forceLocale*/));
      ...
    }

####  view

```js

{{ jed.gettext('some key') }}
{{ jed.dgettext('domain', 'some key') }}
{{ moment().format('llll') }}
{{ numeral(1000).format('currency') }}numberFormat.formats)

```

### 完整配置
- **i18nFolder:string**
  放置配置文件的目录
- **localesMapping:function(locales){return localeId;}**
  从一个可能的 locale 数组，返回唯一一个 localeId。比如 header['accept-language'].split(',') 可以得到一个locale 的数组，我们可以写一些逻辑并返回最终我们想要的 localeId。
- **getLocale**
  如果为空，默认逻辑是从 http 头的 accept-language 里面获取，并用 ',' 分割开。
  如果希望从 url 的 query 字段获取，设置为 {by: 'query', name: '字段名'}.
  如果希望从 cookie 里面的某个字段获取， 设置为 {by: 'cookie', name: '字段名'}
  也可以根据 controller.ctx 实现自己的逻辑, function([ctx](https://github.com/koajs/koa/blob/master/docs/api/context.md)) {return locale;}

- **debugLocale**
  用来调试某个 localeId

- **jedOptions**
  是一个对象，可以在里面配置 **domain** 和 **missing_key_callback**，具体请参考 [jed options 文档](http://messageformat.github.io/Jed/).

  默认的值是 {}, 最终用来实例化 jed 的 options 如下：

``` js
   Object.assign(jedOptions, {locale_data: <your locale translation>})
```

### 背后的思考
- 你可能会觉得这个方案太复杂，但是 i18n 本来就很复杂，要想实现的好，你可能需要的只会更多。
- 既然基于 moment 和 numeral，为什么不直接使用它们自带的 i18n 配置？这里为的是配置的透明和可控制性，你可以灵活的组合在某一个 locale 下，分别使用什么样语言翻译，时间格式和数字格式。比如有一个在中国的购物网站，希望提供英文的翻译方便老外使用，但是货币数字和时间的格式仍然使用中国的标准。参考下面的配置：

```javascript
  // locale setting of en-CH.js
  module.exports = {
    localeId: 'en_CH',
    translation: require('../english.po.json'),
    dateFormat: require('../moment/en.json'),
    numeralFormat: require('../numeral/en.json')
  };
```
其中 `../moment/en.json` 是一个json，格式参考 moment 的i18n文件，一模一样。

其中 `../numeral/en.json` 是一个json，格式参考 numeral， 需要指出的是，额外的你可以在 numeral 的配置里面设置自定义的格式，并且这个是跟着locale走的，这个实现是个小小的黑魔法，但是对于 i18n 的最佳实践非常重要。

``` js
  {
    localeId: cn,
    ...
    formats: [{name: 'currency', format: '000.00$'}]
  }
```


#### 最佳实践

总是使用自定义的格式，这样就可以通过配置定制不用locale下有不同的输出格式。同时也方便后期的维护，比如某天我们需要把所有长日期显示修改格式，不用到每个文件里面取修改，只需要改配置就好，相当于一层抽象。

  - 使用 **moment().format('llll')** 而不是 moment().format('YYYY-MM-dd HH:mm').
  - 使用 **numeral(value).format('customFormat')** 而不是 numeral(value).format('00.00$'), [Numeral](https://github.com/adamwdraper/Numeral-js) 是不支持对每个 locale 自定义格式的，类库里面通过额外的代码支持了这个功能（具体可以看源码），配置方式参考 locale.numeralFormat.formats。


#### 注
如果定义了 **en** locale， 会覆盖 [Numeral](https://github.com/adamwdraper/Numeral-js) 默认的配置。

## 调试某个 locale
  默认情况下，是通过读取 header['accept-language'] 的值，然后通过 localesMapping 转换后作为某一时刻采纳的 locale。如果需要调试，在 view 配置里面设置 **debugLocal** = <locale>
