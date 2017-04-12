const Jed = require('jed');
const path = require('path');
const helper = require('think-helper');
const cookie = require('cookie');
const moment = require('moment');
const numeral = require('numeral');
const assert = require('assert');


/**
 * add some methods for controller
 */
module.exports = ({i18nFolder, defaultLocale='cn', localesMapping, debugLocale})=> {

  assert(helper.isString(defaultLocale), 'defaultLocale must be string');

  let files = helper.getdirFiles(i18nFolder).filter(p=>/\.js$/.test(p));
  const locale_data = {};
  const custom_numeral_formats = [];
  files.map(fileName=>{
    var config = require(path.join(i18nFolder, fileName));
    let {localeId, dateFormat, numeralFormat, translation} = config;
    if(dateFormat) {
      moment.locale(localeId, dateFormat);
    }
    if(numeralFormat) {
      let cnFormats = custom_numeral_formats[localeId] = numeralFormat.formats || [];
      delete numeralFormat.formats;
      assert(helper.isArray(cnFormats), 'numeralFormat.formats must be array, in locale ' + localeId);
      numeral.locales[localeId] = numeralFormat;
    }
    if(translation) {
      locale_data[localeId] = Object.assign({
        "": {
          domain: localeId,
          lang: translation.language,
          plural_forms : translation.plural_forms
        },
      }, translation.data);
    }
  });

  var curLocale = defaultLocale;
  var i18n;
  const jedInstance = new Jed({
    "domain" : defaultLocale,
    "missing_key_callback" : function(key) {
      console.error('missing key:', key)
    },
    locale_data
  });

  var numeral_custom_format_pass_through = false;
  numeral.register('format', 'think_i18n_numeral_format', {
    regexps: {
      format: /^.+$/,
      unformat: /^.+$/
    },
    format: function(value, format, roundingFunction) {

      if(!numeral_custom_format_pass_through) {
        var customFormat = (custom_numeral_formats[numeral.locale()] || []).find(item=>item.name === format);
        if(customFormat) {
          numeral_custom_format_pass_through = true;
          var result = numeral(value).format(customFormat.format, roundingFunction);
          numeral_custom_format_pass_through = false;
          return result;
        }
      }
      return numeral._.numberToFormat(value, format, roundingFunction);
    },
    unformat: function(string) {
      return numeral._.stringToNumber(string);
    }
  });
  return {
    controller: {
      getLocale() {
        var locales = this.ctx.request.header['accept-language'].split(',') || [];
        return debugLocale || localesMapping(locales) || defaultLocale;
      },
      // all i18n provider re-initialization
      // locale(String);
      i18n(locale=this.getLocale()){
        if(!helper.isString(locale)) {
          throw new Error('controller.i18n(locale), locale must be string or undefined');
        }
        if(locale === curLocale && i18n) return i18n;
        curLocale = locale;

        // jed
        jedInstance.options.domain = locale;

        // moment
        moment.locale(locale);

        // numeral
        numeral.locale(locale);

        i18n = {
          jed: jedInstance,
          moment: moment,
          numeral: numeral
        };
        return i18n;
      }
    }
  }
}
