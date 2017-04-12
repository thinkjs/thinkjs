# think-i18n
i18n solution in thinkjs 3.0, implement base on [Jed](https://github.com/messageformat/Jed), [Moment](https://github.com/moment/moment/) and [Numeral](https://github.com/adamwdraper/Numeral-js). at last it will extend **controller** with
only one method **i18n**

    i18n(locale) {
      /*
        if (locale is empty then)
          get locales from ctx.request.header['Accept-Language'] split by ','
          map locales to on locale use **localesMapping** config

        if(locale !== currentLocale) {
          // Change the locale of moment, numeral and jed
          // Just let you know jed is singlton, all locale data will be loaded at start, we only change the domain here so that to minimum the cost.
        }
      */
      return {moment, numeral, jed};
    }


## how to use

    npm install think-i18n --save

### configure extends.js
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

### provide locale settings

**dateFormat** 会调用 moment.local(localeId, dateFormat);

**numeralFormat** 会调用 numeral.locales[localeId] = numeralFormat;

**translation** 会被mapReduce 出 jed 的 locale_data 配置， 其中 localeId 会被映射成 domain

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

### controller and view (nunjucks)

  in controller

    async indexAction(){
      this.assign(this.i18n(/*forceLocale*/));
      ...
    }

  in view

    {{ jed.gettext('some key') }} 翻译
    {{ moment().format('llll') }} 时间
    {{ numeral(1000).format('currency') }} 自定义货币格式


### why not use moment bundled i18n configure
for transparent but most importantly, flexibility to compose you date, number and message's localization per locale, for example, you have a website in China and want to provide English translation, but keep the chinese currency symbol, so you can configure the en.js file to use
一个是配置的透明性，更重要的是，你可以更灵活的给一个locale 组合不同的时间，数字和翻译的设置，比如有一个购物网站我希望展示英文描述，但是用中文的货币符号和中文的日期。

### 注意
配置文件定义的locale 会覆盖numeral

## 关于调试不同的locale

  getLocal 的默认实现是获取 header['accept-language'] 的值，然后调用 localesMapping 获取。如果希望跳过这一步，可以在配置 extend 的时候传入 debugLocal

## 最佳实践

### 时间和数字尽量使用自定义的格式，

  用 moment().format('llll') 而不是 moment().format('YYYY-MM-dd HH:mm')

  用 numeral(value).format('currency'), 并对每一个支持的locale 配置 currency, 而不是使用 numeral(value).format('$ 00.00')

### this.getI18n().jed

  关于 po 文件和 json 格式的转换，可以参考 Jed 官网，上面提供了相应工具的连接，

  jed 提供了两种写法，传统的 gettext 或者新版的 translate，最好统一写法，方便后期用工具（todo）从代码中抽取出所有的 key 并且生成 po 文件。
