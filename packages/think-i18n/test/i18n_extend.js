const test = require('ava');
const path = require('path');
const mock = require('mock-require');
const helper = require('think-helper');
function getInstance() {
  const i18n = mock.reRequire('../src/i18n');
  return new i18n();
}

function mockLocaleConfigs(instance, config={}) {
  instance.loadLocaleConfigs = function() {
    return config;
  }
}

test.afterEach.always(t => {
  mock.stopAll();
});

test('extend will call loadLocaleConfigs with options', t=>{
  var expectOptions;
  var options = {};
  var instance = getInstance();

  instance.loadLocaleConfigs = function(opt) {expectOptions = opt};

  var extend = instance.extend(options);
  var controller = extend.controller;

  t.is(expectOptions, options);
  t.is(helper.isObject(controller), true);
  t.is(helper.isFunction(controller.getLocale), true);
  t.is(helper.isFunction(controller.i18n), true);
});


test('when getLocale is empty read from accept-language', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var extend = instance.extend({});
  var mockController = {ctx: {request: {header: {'accept-language': 'a,b,c,d'}}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.deepEqual(locales, ['a','b','c','d']);
});

test('when getLocale is empty read from accept-language 2', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var extend = instance.extend({});
  var mockController = {ctx: {request: {header: {}}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.deepEqual(locales, []);
});

test('when getLocale is function', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale(ctx){expectCtx = ctx; return ['localeId'];}});
  var mockController = {ctx: {request: {header: {}}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.deepEqual(expectCtx, {request: {header: {}}});
  t.deepEqual(locales, ['localeId']);
});

test('when getLocale by cookie', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'cookie', name: 'locale'}});
  var mockController = {ctx: {request: {header: {}}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.deepEqual(locales, []);
});

test('when getLocale by cookie 2', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'cookie', name: 'locale'}});
  var mockController = {ctx: {request: {header: {cookie: 'sasd=aaa;locale=en-ch'}}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.deepEqual(locales, ['en-ch']);
});


test('when getLocale by query', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'query', name: 'locale'}});
  var mockController = {ctx: {request: {url: 'asdfjsjfa'}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.deepEqual(locales, []);
});

test('when getLocale by query 2', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'query', name: 'locale'}});
  var mockController = {ctx: {request: {url: 'asdfjsjfa?locale=en'}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.deepEqual(locales, ['en']);
});

test('when getLocale by query 3', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'query', name: 'locale'}});
  var mockController = {ctx: {request: {url: 'asdfjsjfa?asjfksj=223&locale=en'}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.deepEqual(locales, ['en']);
});

test('when getLocale by query 4', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'query', name: 'locale'}});
  var mockController = {ctx: {request: {url: 'asdfjsjfa%3Fasjfksj%3D223%26locale%3Den%26aaa%3D222%23somehash'}}};
  var locales = extend.controller.getLocale.bind(mockController)();
  t.deepEqual(locales, ['en']);
});

test('when getLocale by unknown 5', t=>{
  var instance = getInstance();
  var expectCtx;
  mockLocaleConfigs(instance);
  var extend = instance.extend({getLocale: {by: 'sfsdfsd', name: 'locale'}});
  var mockController = {};

  var err = t.throws(()=>{
    extend.controller.getLocale.bind(mockController)();
  }, Error);
  t.is(err.message, 'getLocale.by must be value of "header", "query" or  "cookie".');
});


test('i18n will use param if provide', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var extend = instance.extend({});
  var err = t.throws(()=>{
    extend.controller.i18n({});
  }, Error);
  t.is(err.message, 'controller.i18n(locale), locale must be string or undefined');
});

test('i18n will use debugLocale if provide and param not provided', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var extend = instance.extend({debugLocale: {}});
  var err = t.throws(()=>{
    extend.controller.i18n();
  }, Error);
  t.is(err.message, 'controller.i18n(locale), locale must be string or undefined');
});


test('i18n will use getLocale if not provide param and debugLocale', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var callTimes = 0;
  var expectParam;
  var extend = instance.extend({localesMapping: function(a){expectParam = a; return {};}});
  var controller = extend.controller;
  controller.getLocale = function(){callTimes++; return 'getLocale';}
  var err = t.throws(()=>{
    controller.i18n();
  }, Error);
  t.is(callTimes, 1);
  t.is(expectParam, 'getLocale');
  t.is(err.message, 'controller.i18n(locale), locale must be string or undefined');
});

test('i18n will throw if no matched localeConfig is found', t=>{
  var instance = getInstance();
  mockLocaleConfigs(instance);
  var extend = instance.extend({});
  var controller = extend.controller;
  var err = t.throws(()=>{
    controller.i18n('someLocale');
  }, Error);
  t.is(err.message, 'locale config someLocale not found');
});

test('i18n will return i18n object not match locales for moment and numeral', t=>{
  var moment = {locale(a){this.locale = a;}};
  var numeral = {locale(a){this.locale = a;}};
  var jedParam;
  var jed = function(param) {jedParam = param; this.gettext=function(key){return key}};
  mock('moment', moment);
  mock('numeral', numeral);
  mock('jed', jed);
  var instance = getInstance();
  mockLocaleConfigs(instance, {someLocale: {translation: {}}});
  var extend = instance.extend({jedOptions: {value: 'value'}});
  var controller = extend.controller;

  const result = controller.i18n('someLocale');

  t.is(moment.locale, 'en');
  t.is(numeral.locale, 'en');
  t.deepEqual(jedParam, {value: 'value', locale_data: {}});

  t.is(result.__('some key'), 'some key');
  t.is(result.__.moment, moment);
  t.is(result.__.numeral, numeral);
});

test('i18n will return i18n object not match locales for moment and numeral no jedOptions', t=>{
  var moment = {locale(a){this.locale = a;}};
  var numeral = {locale(a){this.locale = a;}};
  var jedParam;
  var jed = function(param) {jedParam = param; this.gettext=function(key){return key}};
  mock('moment', moment);
  mock('numeral', numeral);
  mock('jed', jed);
  var instance = getInstance();
  mockLocaleConfigs(instance, {someLocale: {translation: {}}});
  var extend = instance.extend({});
  var controller = extend.controller;

  const result = controller.i18n('someLocale');

  t.is(moment.locale, 'en');
  t.is(numeral.locale, 'en');
  t.deepEqual(jedParam, {locale_data: {}});

  t.is(result.__('some key'), 'some key');

  t.is(result.__.moment, moment);
  t.is(result.__.numeral, numeral);
});


test('i18n will return i18n object and change locale accordingly', t=>{
  var moment = {locale(a){this.locale = a;}};
  var numeral = {locale(a){this.locale = a;}};
  var jedParam;
  var jed = function(param) {jedParam = param; this.gettext=function(key){return key}};
  mock('moment', moment);
  mock('numeral', numeral);
  mock('jed', jed);
  var instance = getInstance();
  mockLocaleConfigs(instance, {someLocale: {dateFormat: {}, numeralFormat: {}, translation: {}}});
  var extend = instance.extend({});
  var controller = extend.controller;

  const result = controller.i18n('someLocale');

  t.is(moment.locale, 'someLocale');
  t.is(numeral.locale, 'someLocale');
  t.deepEqual(jedParam, {locale_data: {}});

  t.is(result.__('some key'), 'some key');
  t.is(result.__.moment, moment);
  t.is(result.__.numeral, numeral);
});


