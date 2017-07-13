const test = require('ava');
const path = require('path');
const mock = require('mock-require');

function getInstance() {
  const i18n = mock.reRequire('../src/i18n');
  return new i18n();
}


test.afterEach.always(t => {
  mock.stopAll();
});


test('test assert', t=>{
  var condition, message, value;
  mock('assert', function(c, m) {
    condition = c;
    message = m;
  });
  mock('think-helper', {type: function(v){
    value = v;
    return 'condition';
  }});
  var instance = getInstance();
  instance.assert('type', 'value', 'message');

  t.is(condition, 'condition');
  t.is(message, 'message');
  t.is(value, 'value');
});

test('validateGetLocale passed correct value', t=>{

  var instance = getInstance();
  // getLocale is empty
  t.is(instance.validateGetLocale(), true);
  t.is(instance.validateGetLocale({by: 'cookie', name: 'name'}), true);
  t.is(instance.validateGetLocale({by: 'query', name: 'queryField'}), true);
  t.is(instance.validateGetLocale(function customFunc() {}), true);
});

test('validateGetLocale pass object, incorrect type and no name', t=>{
  var cms = [];
  mock('assert', function(c, m){
    cms.push(c, m);
  });
  var instance = getInstance();
  instance.validateGetLocale({by: 'unknow'});
  t.deepEqual(cms, [false, 'getLocale.by must be value of "cookie" or "query", value is unknow', false, 'missing getLocale.name']);

});

test('validateGetLocale pass incorrect type', t=>{
  var cms = [];
  mock('assert', function(c, m){
    cms.push(c, m);
  });
  var instance = getInstance();
  instance.validateGetLocale('sfjsdk');
  t.deepEqual(cms, [false, 'getLocale must be either object or function']);
});

test('getConfigFiles', t=>{
  var arg;
  mock('think-helper', {getdirFiles: function(a){
    arg = a;
    return ['a.js', 'b', 'c.es', 'd.js'];
  }});
  var instance = getInstance();
  var result = instance.getConfigFiles('i18nFolder');
  var expectResult = ['a.js', 'd.js'].map(f=>path.join('i18nFolder', f));
  t.deepEqual(result, expectResult);
});

test('getCofnigFiles will assert when no file is matched', t=>{
  var args = [];
  mock('assert', function(a,b){
    args.push(a,b);
  });
  mock('think-helper', {getdirFiles: function(){
    return ['a', 'b'];
  }});
  var instance = getInstance();
  instance.getConfigFiles('i18nFolder');
  t.deepEqual(args, [false, 'missing locale setting, no .js files are found in i18nFolder']);
});

test('prepareOptions will call with right params', t=>{
  var args = [];
  var getLocaleArg, i18nFolder;
  var instance = getInstance();
  instance.assert = function(a, b, c) {
    args.push(a,b,c);
  }
  instance.validateGetLocale = function(a) {
    getLocaleArg = a;
  }
  instance.getConfigFiles = function(a) {
    i18nFolder = a;
    return 'getConfigFiles';
  }

  var result = instance.prepareOptions({
    i18nFolder: 'i18nFolder',
    localesMapping: 'localesMapping',
    getLocale: 'getLocale'
  });
  t.deepEqual(args, [
    'isString', 'i18nFolder', 'i18nFolder should be type of string',
    'isDirectory', 'i18nFolder', 'i18nFolder must be directory path',
    'isFunction', 'localesMapping', 'missing configure localesMapping(locales){return locale;}'
  ]);
  t.is(getLocaleArg, 'getLocale');
  t.is(i18nFolder, 'i18nFolder');
  t.is(result, 'getConfigFiles');
});

test('loadLocaleSettings', t=>{
  var expectCallWith = [];
  var locales = {};
  var localeId = 'localeId';
  var dateFormat = {};
  var numeralFormat = {formats: [1,2,3]};
  var translation = {};
  var localeFiles = ['a'];
  var config = {localeId, dateFormat, translation, numeralFormat};
  mock('a', config);
  mock('moment', {locale(a,b){expectCallWith.push(a,b)}});
  mock('numeral', {locales});
  var instance = getInstance();
  var result = instance.loadLocaleSettings(localeFiles);

  t.deepEqual(expectCallWith, ['localeId', dateFormat]);
  t.deepEqual(locales, {localeId: {}});
  t.deepEqual(result, {
    localeConfigs: {localeId: config},
    customNumeralFormats: {localeId: [1,2,3]}
  });
});

test('applyNumeralCustomFormat', t=>{
  var instance = getInstance();
  instance.applyNumeralCustomFormat({
    en: [{name: 'currency', format: '$ 000.000'}]
  });
  var value = 11111.1111;
  var numeral = require('numeral');
  t.is(numeral(value).format('currency'), numeral(value).format('$ 000.000'));
});