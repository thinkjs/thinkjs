# think-i18n
[简体中文文档](https://github.com/thinkjs/think-i18n/blob/master/README_ch_CN.md)

i18n solution in thinkjs 3.0, implement base on [Jed](https://github.com/messageformat/Jed), [Moment](https://github.com/moment/moment/) and [Numeral](https://github.com/adamwdraper/Numeral-js).

## Features
 - I18N solution cover translation, datetime and number display.
 - Support per locale custom format for datetime and number.
 - Easy to use, just defined your expect format and translation in each locale file and the library will help to apply locale settings on time, no more annoying locale switching!
 - Easy to debug
 - Locale switch process is Customizable to suit your case.

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

- **dateFormat** will apply to moment.local(localeId, dateFormat);
- **numeralFormat** will apply numeral.locales[localeId] = numeralFormat;
- **translation** will be transform to jed's locale_data， localeId  is mapped to domain.
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

### Controller and View (nunjucks)

####  in controller

    async indexAction(){
      this.assign(this.i18n(/*forceLocale*/));
      ...
    }

####  in view

```js

{{ jed.gettext('some key') }} translation
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