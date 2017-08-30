const view = require('think-view');
const fetch = require('think-fetch');
const model = require('think-model');
const createI18n = require('think-i18n');
const path = require('path');
const websocket = require('think-websocket');
const mongoose = require('think-mongoose');

var regCn = /^cn.*$/;
var regEn = /^en.*$/;
const i18n =  createI18n({
  app: think.app,
  i18nFolder: path.resolve(__dirname, './locales'),
  defaultLocale: 'zh-cn',
  getLocale: {by: 'query', name: 'locale'},
  localesMapping(locales) {
    for(l of locales) {
      if(regCn.test(l)) {
        return 'zh-cn';
      }
      if(regEn.test(l)) {
        return 'en-us';
      }
    }
    // default
    return 'zh-cn';
  },
  // debugLocale: 'cn'
})

module.exports = [
  view, //make application support view
  fetch, // HTTP request client
  model(think.app),
  i18n,
  websocket(think.app),
  mongoose(think.app)
];

