const view = require('think-view');
const fetch = require('think-fetch');
const model = require('think-model');
const createI18n = require('think-i18n');
const path = require('path');

var regCn = /^cn.*$/;
var regEn = /^en.*$/;
const i18n =  createI18n({
  i18nFolder: path.resolve(__dirname, './locales'),
  defaultLocale: 'zh-CN',
  getLocale: {by: 'query', name: 'locale'},
  localesMapping(locales) {
    for(l of locales) {
      if(regCn.test(l)) {
        return 'zh-CN';
      }
      if(regEn.test(l)) {
        return 'en-US';
      }
    }
    // default
    return 'zh-CN';
  },
  // debugLocale: 'cn'
})

module.exports = [
  view, //make application support view
  fetch, // HTTP request client
  model,
  i18n
];

