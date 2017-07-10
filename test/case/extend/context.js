import test from 'ava';
const helper = require('think-helper');
let context = require('../../../lib/extend/context');


const mockContext = {
  header: {
    'user-agent': 'Mozilla/5.0',
    referer: 'https://github.com/thinkjs/thinkjs',
    'x-requested-with':'XMLHttpRequest',
  },
  method: 'GET',
  configuration:{
    jsonpCallbackField:'_callback',
    errnoField:'errno',
    errmsgField:'errmsg',
    defaultErrno:10010,
    jsonContentType:'application/json;charset=utf-8'
  },
  config(name){
    return this.configuration[name]
  },
  param(name){
    if(name === '_callback'){
      return 'test'
    }
  }
};

const mockThink = {
  isCli: true,
  isNumber(param){
    const numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
    return numberReg.test(param)
  },
  isArray(param){
    return Array.isArray(param)
  },
  app:{
    validators:{
      messages:{
        TEST_RULE:[1000,'test'],
        TEST_NON_ARRAY_RULE:'test'
      }
    }
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
  t.is(context.isJsonp(),true)
  t.is(context.isJsonp('_callback'),true)
});

test.serial('jsonp', async t => {
  context.jsonp({name:'thinkjs'})
  t.is(context.body,'test({"name":"thinkjs"})');
});

test.serial('jsonp', async t => {
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