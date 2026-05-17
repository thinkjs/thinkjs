const Jed = require('jed');
const path = require('path');
const helper = require('think-helper');
const cookie = require('cookie');
const moment = require('moment');
const numeral = require('numeral');
const assert = require('assert');

module.exports = class i18n {
  assert(type, value, message) {
    assert(helper[type](value), message);
  }

  validateGetLocale(getLocale) {
    if (getLocale) {
      if (helper.isObject(getLocale)) {
        assert(['cookie', 'query'].indexOf(getLocale.by) > -1, 'getLocale.by must be value of "cookie" or "query", value is ' + getLocale.by);
        assert(getLocale.hasOwnProperty('name'), 'missing getLocale.name');
      } else {
        assert(helper.isFunction(getLocale), 'getLocale must be either object or function');
      }
    }
    return true;
  }

  getConfigFiles(i18nFolder) {
    const files = helper.getdirFiles(i18nFolder).filter(p => /\.js$/.test(p));
    assert(files.length > 0, 'missing locale setting, no .js files are found in ' + i18nFolder);
    return files.map(f => path.join(i18nFolder, f));
  }

  prepareOptions(options) {
    var { i18nFolder, localesMapping, getLocale } = options;
    this.assert('isString', i18nFolder, 'i18nFolder should be type of string');
    this.assert('isDirectory', i18nFolder, 'i18nFolder must be directory path');
    this.assert('isFunction', localesMapping, 'missing configure localesMapping(locales){return locale;}');
    this.validateGetLocale(getLocale);

    return this.getConfigFiles(i18nFolder);
  }

  loadLocaleSettings(localeFiles) {
    const localeConfigs = {};
    const customNumeralFormats = {};
    localeFiles.map(filePath => {
      var config = require(filePath);
      const { localeId, dateFormat, numeralFormat, translation } = config;
      localeConfigs[localeId] = config;
      if (dateFormat) {
        moment.locale(localeId, dateFormat);
      }
      if (numeralFormat) {
        const cnFormats = customNumeralFormats[localeId] = numeralFormat.formats || [];
        delete numeralFormat.formats;
        assert(helper.isArray(cnFormats), `numeralFormat.formats must be array, in locale ${localeId}`);
        numeral.locales[localeId] = numeralFormat;
      }

      assert(helper.isObject(translation), `missing translation in locale ${localeId}, refer to jed locale_data`);
    });
    return { localeConfigs, customNumeralFormats };
  }

  applyNumeralCustomFormat(customNumeralFormats) {
    var numeralCustomFormatPassThrough = false;
    numeral.register('format', 'think_i18n_numeral_format', {
      regexps: {
        format: /^.+$/,
        unformat: /^.+$/
      },
      format: function(value, format, roundingFunction) {
        if (!numeralCustomFormatPassThrough) {
          var customFormat = (customNumeralFormats[numeral.locale()] || []).find(item => item.name === format);
          if (customFormat) {
            numeralCustomFormatPassThrough = true;
            var result = numeral(value).format(customFormat.format, roundingFunction);
            numeralCustomFormatPassThrough = false;
            return result;
          }
        }
        return numeral._.numberToFormat(value, format, roundingFunction);
      },
      unformat: function(string) {
        return numeral._.stringToNumber(string);
      }
    });
  }

  loadLocaleConfigs(options) {
    var localeFiles = this.prepareOptions(options);
    var { localeConfigs, customNumeralFormats } = this.loadLocaleSettings(localeFiles);
    this.applyNumeralCustomFormat(customNumeralFormats);

    return localeConfigs;
  }

  extend(options) {
    var localeConfigs = this.loadLocaleConfigs(options);

    var { app, getLocale, localesMapping, debugLocale, jedOptions = {} } = options;
    var curLocale, i18n;

    function _getLocale() {
      let locale;
      if (!getLocale) {
        var header = this.ctx.request.header;
        if (header && header['accept-language']) {
          return header['accept-language'].split(',');
        }
        return [];
      }
      if (helper.isObject(getLocale)) {
        switch (getLocale.by) {
          case 'query':
            if (!getLocale.reg) {
              getLocale.reg = new RegExp(`${getLocale.name}=([^&]*)`);
            }
            locale = (getLocale.reg.exec(decodeURIComponent(this.ctx.request.url)) || {})[1];
            return locale ? [locale] : [];
          case 'cookie':
            var c = this.ctx.request.header.cookie;
            if (c) {
              locale = cookie.parse(c)[getLocale.name];
            }
            return locale ? [locale] : [];
          default:
            throw new Error('getLocale.by must be value of "header", "query" or  "cookie".');
        }
      } else if (helper.isFunction(getLocale)) {
        return getLocale(this.ctx);
      }
    }

    function getI18nInstance(locale) {
      if (!locale) {
        locale = debugLocale || localesMapping(this.getLocale());
      }

      if (!helper.isString(locale)) {
        throw new Error('controller.getI18n(locale), locale must be string or undefined');
      }
      if (locale === curLocale && i18n) return i18n;
      curLocale = locale;

      var localeConfig = localeConfigs[locale];
      if (!localeConfig) {
        throw new Error(`locale config ${locale} not found`);
      }

      // jed
      var jed = new Jed(Object.assign(jedOptions, { locale_data: localeConfig.translation }));

      // moment
      if (localeConfig.dateFormat) {
        moment.locale(locale);
      } else {
        moment.locale('en');
      }

      if (localeConfig.numeralFormat) {
        numeral.locale(locale);
      } else {
        numeral.locale('en');
      }
      const __ = function(key) {
        return jed.gettext(key);
      };
      __.jed = jed;
      __.moment = moment;
      __.numeral = numeral;

      return __;
    }

    if (app) {
      app.on('viewInit', (view, controller) => {
        view.assign('__', controller.getI18n());
      });
    }

    return {
      controller: {
        getLocale: _getLocale,
        getI18n: getI18nInstance
      }
    };
  }
};
