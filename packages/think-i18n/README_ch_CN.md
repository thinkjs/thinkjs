# think-i18n
[English Document](https://github.com/thinkjs/think-i18n)

thinkjs 3.0 国际化方案, 基于 [Jed](https://github.com/messageformat/Jed), [Moment](https://github.com/moment/moment/) 和 [Numeral](https://github.com/adamwdraper/Numeral-js).

## 特性
 - 涵盖了翻译，日期显示和数字、货币显示。
 - 支持给每个 locale 配置自定义的日期和数字格式。
 - 简单易用，只需要定义好每个 locale 的行为，插件会在合适的时间应用配置，再也不需要手工繁琐的切换各个类库的 locale 。
 - 方便调试不同 locale。
 - 可以定制方案的各个步骤行为。

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

- **dateFormat** 会应用到 moment.local(localeId, dateFormat);
- **numeralFormat** 会应用到 numeral.locales[localeId] = numeralFormat;
- **translation** 会被转换成 Jed 的 locale_data, localeId 被映射成 domain.
```js
module.exports = {
  localeId: 'cn',
  dateFormat: {
    months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
    monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
    weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
    weekdaysShort : '周日_周一_周二_周三_周四_周五_周六'.split('_'),
    weekdaysMin : '日_一_二_三_四_五_六'.split('_'),
    longDateFormat : {
      LT : 'HH:mm',
      LTS : 'HH:mm:ss',
      L : 'YYYY年MMMD日',
      LL : 'YYYY年MMMD日',
      LLL : 'YYYY年MMMD日Ah点mm分',
      LLLL : 'YYYY年MMMD日ddddAh点mm分',
      l : 'YYYY年MMMD日',
      ll : 'YYYY年MMMD日',
      lll : 'YYYY年MMMD日 HH:mm',
      llll : 'YYYY年MMMD日dddd自定义的格式 HH:mm'
    },
    meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
    meridiemHour: function (hour, meridiem) {
      if (hour === 12) {
          hour = 0;
      }
      if (meridiem === '凌晨' || meridiem === '早上' || meridiem === '上午') {
        return hour;
      } else if (meridiem === '下午' || meridiem === '晚上') {
        return hour + 12;
      } else {
        // '中午'
        return hour >= 11 ? hour : hour + 12;
      }
    },
    meridiem : function (hour, minute, isLower) {
      var hm = hour * 100 + minute;
      if (hm < 600) {
          return '凌晨';
      } else if (hm < 900) {
          return '早上';
      } else if (hm < 1130) {
          return '上午';
      } else if (hm < 1230) {
          return '中午';
      } else if (hm < 1800) {
          return '下午';
      } else {
          return '晚上';
      }
    },
    calendar : {
      sameDay : '[今天]LT',
      nextDay : '[明天]LT',
      nextWeek : '[下]ddddLT',
      lastDay : '[昨天]LT',
      lastWeek : '[上]ddddLT',
      sameElse : 'L'
    },
    dayOfMonthOrdinalParse: /\d{1,2}(日|月|周)/,
    ordinal : function (number, period) {
      switch (period) {
        case 'd':
        case 'D':
        case 'DDD':
          return number + '日';
        case 'M':
          return number + '月';
        case 'w':
        case 'W':
          return number + '周';
        default:
          return number;
      }
    },
    relativeTime : {
      future : '%s内',
      past : '%s前',
      s : '几秒',
      m : '1 分钟',
      mm : '%d 分钟',
      h : '1 小时',
      hh : '%d 小时',
      d : '1 天',
      dd : '%d 天',
      M : '1 个月',
      MM : '%d 个月',
      y : '1 年',
      yy : '%d 年'
    },
    week : {
      // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
      dow : 1, // Monday is the first day of the week.
      doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
  },
  numeralFormat: {
    delimiters: {
      thousands: ',',
      decimal: '.'
    },
    abbreviations: {
      thousand: '千',
      million: '百万',
      billion: '十亿',
      trillion: '兆'
    },
    ordinal: function (number) {
      return '.';
    },
    currency: {
      symbol: '¥'
    },
    formats: [ // 定义缩写
      {name: 'currency', format: '0,0[.]00 $'} // numeral(1000).format(currency) === numeral(1000).format('0,0[.]00 $')
    ]
  },
  translation: {
    language: 'cn',
    "plural_forms" : "nplurals=1; plural=(n != 1);",
    data: {
      "some key" : [ "一些键"]
    }
  }
}

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