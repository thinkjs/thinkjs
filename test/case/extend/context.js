import test from 'ava';
const helper = require('think-helper');
const config = require('../../../lib/config/config');
const mockie = require('../../lib/mockie');
mockie.mockCookies();
let context = require('../../../lib/extend/context');

const mockContext = {
  data: {},
  header: {
    'user-agent': 'Mozilla/5.0',
    referer: 'https://github.com/thinkjs/thinkjs',
    'x-requested-with': 'XMLHttpRequest',
  },
  method: 'GET',
  request: {
    body: {
      post: {name: 'thinkjs', version: 3},
      file: {name: 'img'}
    }
  },
  // param(name){
  //   if (name === '_callback') {
  //     return 'test'
  //   }
  // },
  set(key, value){
    this.data[key] = value;
  },
  req:{},
  res:{},
};

const mockThink = {
  configuration: {
    jsonpCallbackField: '_callback',
    errnoField: 'errno',
    errmsgField: 'errmsg',
    defaultErrno: 10010,
    jsonContentType: 'application/json;charset=utf-8'
  },
  isCli: true,
  isNumber(param){
    const numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
    return numberReg.test(param)
  },
  isArray(param){
    return Array.isArray(param)
  },
  app: {
    validators: {
      messages: {
        TEST_RULE: [1000, 'test'],
        TEST_NON_ARRAY_RULE: 'test'
      }
    }
  },
  config(name){
    return this.configuration[name]
  },
  controller(){},
  service(){},
  logger:{
    error:(err)=>{return err}
  }
};

Object.assign(context, mockContext);

global.think = Object.assign({}, mockThink);

test.serial('get userAgent', async t => {
  t.is(context.userAgent, mockContext.header['user-agent'])
});

test.serial('referer', async t => {
  t.is(context.referer(), mockContext.header['referer']);
  t.is(context.referer(true), 'github.com');
});

test.serial('isGet', async t => {
  t.is(context.isGet, true)
});

test.serial('isPost', async t => {
  t.is(context.isPost, false)
});

test.serial('isMethod', async t => {
  t.is(context.isMethod('GET'), true);
  t.is(context.isMethod('POST'), false);
});

test.serial('isMethod', async t => {
  t.is(context.isMethod('GET'), true);
  t.is(context.isMethod('POST'), false);
});

test.serial('get isCli', async t => {
  t.is(context.isCli, true);
});

test.serial('isAjax', async t => {
  t.is(context.isAjax('GET'),true)
  t.is(context.isAjax('POST'),false)
});

test.serial('isJsonp', async t => {
  context.param('_callback','test')
  t.is(context.isJsonp(),true)
  t.is(context.isJsonp('_callback'),true)
});

test.serial('jsonp', async t => {
  context.param('_callback','test')
  context.jsonp({name:'thinkjs'})
  t.is(context.body,'test({"name":"thinkjs"})');
});

test.serial('jsonp', async t => {
  context.param('_callback','test')
  context.jsonp({name:'thinkjs'})
  t.is(context.body,'test({"name":"thinkjs"})');
});

test.serial('jsonp empty fields', async t => {
  context.jsonp('test','empty');
  t.is(context.body,'test');
});

test.serial('json', async t => {
  context.json(JSON.stringify({name:'thinkjs'}));
  t.is(context.body,JSON.stringify({name:'thinkjs'}));
});

test.serial('success', async t => {
  context.success([],'success');
  t.deepEqual(context.body,{errno:0,errmsg:'success',data:[]});
});

test.serial('success', async t => {
  let errObj = {errno:404,errmsg:'fail',data:[]};
  context.fail(errObj);
  t.deepEqual(context.body,errObj);

  context.fail(404,'fail',[]);
  t.deepEqual(context.body,{errno:404,errmsg:'fail',data:[]});

  context.fail('fail',[]);
  t.deepEqual(context.body,{errno:10010,errmsg:'fail',data:[]});

  context.fail('fail');
  t.deepEqual(context.body,{errno:10010,errmsg:'fail'});

  context.fail('TEST_RULE')
  t.deepEqual(context.body,{errno:1000,errmsg:'test'});

  context.fail('TEST_NON_ARRAY_RULE')
  t.deepEqual(context.body,{ errno: 10010, errmsg: 'TEST_NON_ARRAY_RULE' });

});

test.serial('expires', async t => {
  context.expires('1d');
  t.deepEqual(context.data['Cache-Control'],'max-age=86400000');
});

test.serial('config', async t => {
  t.is(context.config('defaultErrno'),10010);
});

test.serial('post', async t => {
  let result = context.post('name');
  result = context.post('name');
  t.is(result, 'thinkjs');
  result = context.post();
  t.deepEqual(result, mockContext.request.body.post)
  let add = {age: 3};
  context.post(add)
  result = context.post();
  t.deepEqual(result, Object.assign({},add,mockContext.request.body.post));
  result = context.post('name,age');
  t.deepEqual(result, {name:'thinkjs',age:3});
  context.post('age',4);
  result = context.post('age');
  t.deepEqual(result, 4);
});

test.serial('param', async t => {
  context.param('name','thinkjs');
  t.is(context.param('name'),'thinkjs');
  t.is(context.param().name,'thinkjs');
  context.param({age:3});
  t.is(context.param().age,3);
  t.is(context.param('name,age').name,'thinkjs')
  t.is(context.param('name,age').age,3)
});

test.serial('file', async t => {
  let result = context.file('name');
  t.is(result,mockContext.request.body.file.name);
  result = context.file();
  t.deepEqual(result,mockContext.request.body.file);
  let file = {filename:'a.jpg'};
  context.file(file);
  result = context.file();
  t.deepEqual(result,Object.assign({},file,mockContext.request.body.file))
  context.file('Content-Type','image/png');
  t.is(context.file('Content-Type'),'image/png')
});

test.serial('cookie', async t => {
  context.cookie('username', 'think');
  t.is(context.cookie('username'), 'think');
  context.cookie('username', null);
  t.is(context.cookie('username'), '');
  let overLength = null;
  context.app = {
    emit(){
      overLength = true;
    }
  };
  let str = new Array(5000).join('|');
  context.cookie('username', str);
  t.is(overLength,true);
});

test.serial('controller / service', async t => {
  context.controller();
  context.service();
});

test.serial('config.onUnhandledRejection/onUncaughtException', async t => {
  t.is('onUnhandledRejection',config.onUnhandledRejection('onUnhandledRejection'));
  t.is('onUncaughtException',config.onUncaughtException('onUncaughtException'));
});