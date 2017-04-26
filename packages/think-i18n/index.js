const Jed = require('jed');
const path = require('path');
const helper = require('think-helper');
const cookie = require('cookie');
const moment = require('moment');
const numeral = require('numeral');
const assert = require('assert');

module.exports = ({i18nFolder, defaultLocale='cn', localesMapping, debugLocale, getLocale, jedOptions={}})=> {

  assert(helper.isString(defaultLocale), 'defaultLocale must be string');

  let files = helper.getdirFiles(i18nFolder).filter(p=>/\.js$/.test(p));
  const localeConfigs = {};
  const custom_numeral_formats = [];
  files.map(fileName=>{
    var config = require(path.join(i18nFolder, fileName));
    let {localeId, dateFormat, numeralFormat, translation} = config;
    localeConfigs[localeId] = config;
    if(dateFormat) {
      moment.locale(localeId, dateFormat);
    }
    if(numeralFormat) {
      let cnFormats = custom_numeral_formats[localeId] = numeralFormat.formats || [];
      delete numeralFormat.formats;
      assert(helper.isArray(cnFormats), 'numeralFormat.formats must be array, in locale ' + localeId);
      numeral.locales[localeId] = numeralFormat;
    }
    if(!translation) {
      throw new Error('translation is empty, refer to jed locale_data');
    }
  });

  var curLocale = defaultLocale;
  var i18n;


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
        if(!getLocale) {
          return this.ctx.request.header['accept-language'].split(',') || [];
        }
        if(helper.isObject(getLocale)) {
          switch(getLocale.by) {
            case 'query':
              reg = new RegExp(`${getLocale.name}=([^&]*)`);
              return [reg.exec(this.ctx.request.url)[1]];
            case 'cookie':
              return [cookie.parse.parse(this.ctx.request.header.cookie)[getLocale.name]];
            default:
              throw new Error('getLocale.by must be value of "header", "query" or  "cookie".');
          }
        } else if(helper.isFunction(getLocale)) {
          return getLocale.bind(this)(this.ctx);
        }
        throw new Error('unknown getLocale config');
      },
      // all i18n provider re-initialization
      // locale(String);
      i18n(locale){
        if(!locale) {
          console.log(localesMapping(this.getLocale()));
          locale = debugLocale || localesMapping(this.getLocale()) || defaultLocale;
        }

        if(!helper.isString(locale)) {
          throw new Error('controller.i18n(locale), locale must be string or undefined');
        }
        if(locale === curLocale && i18n) return i18n;
        curLocale = locale;

        var localeConfig = localeConfigs[locale];
        if(!localeConfig) {
          throw new Error(`locale config ${locale} not found`);
        }

        // jed
        var jed = new Jed(Object.assign(jedOptions, {locale_data: localeConfig.translation}));
        i18n = {jed};

        i18n.moment = function(...args) {
          // set locale locally
          let m = moment(...args);
          if(localeConfig.dateFormat) {
            m.locale(locale);
          }
          return m;
        }

        if(localeConfig.numeralFormat) {
          // numeral, since we can't set number locale locally, so we use bundleDependency in case we want to
          // use numeral in some other way.
          numeral.locale(locale);
        }
        i18n.numeral = numeral;

        return i18n;
      }
    }
  }
}
