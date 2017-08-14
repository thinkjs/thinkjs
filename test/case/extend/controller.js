import test from 'ava';
const helper = require('think-helper');
const mock = require('mock-require');
const mockie = require('../../lib/mockie');
const utils = require('../../lib/utils');
// const path = require('path');

function getApplication() {
  return mock.reRequire('../../../lib/application');
}

const defaultOption = {
  ROOT_PATH: __dirname,
  // APP_PATH: path.resolve(__dirname,'../runtime')
};

const ctx = {
  app:{modules:''},
  body:'hello thinkjs',
  status:404,
  ip:'10.10.10.10',
  ips: '10.10.10.10,11.11.11.11',
  module: '',
  method: 'GET',
  userAgent:'test',
  referrer(onlyHost){
    return onlyHost
  },
  referer(onlyHost){
    return onlyHost
  },
  download(){
    return true
  },
  type: 'text/html; charset=UTF-8',
  isGet: true,
  isPost: false,
  isCli: true,
  params: {name: 'thinkjs'},
  header:{
    accept:'application/json, text/plain, */*',
    'Accept-Encoding':'gzip, deflate, br'
  },
  res:{
  },
  redirect(url,alt){
    return url
  },
  set(name,value){
    if(helper.isObject(name)){
      this.header = Object.assign({},this.header,name);
      return;
    }
    this.header[name] = value;
  },
  isMethod(method){
    return method === this.method;
  },
  isAjax(){
    return true
  },
  isJsonp(callback){
    return callback
  },
  json(str){
    return JSON.parse(str)
  },
  jsonp(data,callback){
    return data;
  },
  success(data,message){
    return {
      errno: 0,
      data,
      errmsg: message || ''
    }
  },
  fail({errno, errmsg, data}){
    return {errno, errmsg, data}
  },
  expires(time){return time},
  param(name,value){
    if(value){
      this.params[name] = value;
      return value;
    }
    return this.params[name]
  },
  post(name,value){return value},
  file(name,value){return value},
  cookie(name,value){return value}
};

mockie.mockCluster(false);
mockie.mockThinkCluster({isFirstWorker:()=>{return true}});
const App = getApplication();
let app = new App(defaultOption);
const controller = new think.Controller(ctx);
app.parseArgv = ()=>{return {}};
app.run();

test('get/set body', async t => {
  const body = 'hello thinkjs again';
  t.is(controller.body,ctx.body);
  controller.body = body;
  t.is(controller.body,body);
});

test('get/set status', async t => {
  const status = 200;
  t.is(controller.status,ctx.status);
  controller.status = status;
  t.is(controller.status,status);
});

test('get/set type', async t => {
  const contentType = 'some content type';
  t.is(controller.type,ctx.type);
  controller.type = contentType;
  t.is(controller.type,contentType);
});


test('get ip', async t => {
  t.is(controller.ip,ctx.ip);
});

test('get ips', async t => {
  t.is(controller.ips,ctx.ips);
});

test('config function', async t => {
  t.is(controller.config('port'), 8360);
  controller.config('port', 8361, ctx.module);
  t.is(controller.config('port'), 8361);
});

test('get method', async t => {
  t.is(controller.method, ctx.method)
});

test('isMethod method', async t => {
  t.is(controller.isMethod(ctx.method), true)
});

test('get isGet', async t => {
  t.is(controller.isGet, true)
});

test('get isPost', async t => {
  t.is(controller.isPost, false)
});

test('isCli method', async t => {
  t.is(controller.isCli, true)
});

test('isAjax method', async t => {
  t.is(controller.isAjax('GET'), true)
});

test('jsonp method', async t => {
  t.is(controller.jsonp('callback'), 'callback')
});

test('isJsonp method', async t => {
  t.is(controller.isJsonp('callback'), 'callback')
});

test('json method', async t => {
  const obj = {
    name:'thinkjs'
  }
  t.deepEqual(controller.json(JSON.stringify(obj)), obj)
});

test('success method', async t => {
  let data = {name:'thinkjs'}
  t.deepEqual(controller.success(data).data, data)
});

test('fail method', async t => {
  let data = {
    errno:404,
    errmsg:'error',
    data:[]
  };
  t.deepEqual(controller.fail(data), data)
});

test('expires method', async t => {
  t.deepEqual(controller.expires(20000), 20000)
});

test('get method', async t => {
  t.deepEqual(controller.get('name'), 'thinkjs');
});

test('query method', async t => {
  t.deepEqual(controller.query('test','test'), 'test');
});

test('post method', async t => {
  t.deepEqual(controller.post('test','test'), 'test');
});

test('file method', async t => {
  t.deepEqual(controller.file('test','test'), 'test');
});

test('cookie method', async t => {
  t.deepEqual(controller.cookie('test','test'), 'test');
});

test('header method', async t => {
  t.is(controller.header('accept'),ctx.header.accept);
  controller.header('Connection','keep-alive');
  t.is(controller.header('Connection'),'keep-alive');
  controller.header({Host:'thinkjs.org'});
  t.is(controller.header('Host'),'thinkjs.org');
  ctx.res.headersSent = true;
  t.is(controller.header('Connection','keep-alive'),undefined);
  t.is(controller.header(),undefined);
});

test('userAgent method', async t => {
  t.deepEqual(controller.userAgent, 'test');
});

test('referrer method', async t => {
  t.deepEqual(controller.referrer(true), true);
});

test('referer method', async t => {
  t.deepEqual(controller.referer(true), true);
});

test('redirect method', async t => {
  const url = 'https://thinkjs.org/';
  t.deepEqual(controller.redirect(url), url);
});

test('controller method', async t => {
  think.app = {
    controllers:{
      test:class TestController{}
    }
  };
  t.is(controller.controller('test') instanceof think.app.controllers.test,true);
});

test('controller method in modules', async t => {
  think.app = {
    controllers:{
      common: {
        test:class TestController{}
      }
    }
  };
  ctx.app.modules = ['test'];
  t.is(controller.controller('test') instanceof think.app.controllers.common.test,true);
});

test.serial('service method with modules', async t => {
  think.app = {
    services:{
      common:{
        test:class TestService{}
      }
    },
    modules:['test','common']
  }
  let ins = controller.service('test');
  t.is(ins instanceof think.app.services.common.test,true);
});

test.serial('service method', async t => {
  think.app = {
    services:{
      test:{}
    },
    modules:[]
  }
  let ins = controller.service('test');
  t.deepEqual(ins,think.app.services.test);
});

test('download method', async t => {
  t.deepEqual(controller.download(), true);
});

test.serial('action method', async t => {
  let runAction = false;
  let runCallAction = false;
  let runAfterAction = false;
  think.app = {
    controllers:{
      test:class TestController{
        testAction(){
          runAction = true;
        }
        __call(){
          runCallAction = true;
        }
        __after(){
          runAfterAction = true;
        }
      }
    }
  };
  await controller.action('test','test');
  t.is(runAction,true);
  await controller.action('test','none');
  t.is(runCallAction,true);
  t.is(runAfterAction,true);

});

test.serial('action with __before and return false', async t => {
  let runAction = false;
  think.app = {
    controllers:{
      test:class TestController{
        __before(){
          return false
        }
        testAction(){
          runAction = true;
        }
      }
    }
  };
  await controller.action('test','test');
  t.is(runAction,false);
});

test.serial('action with __before', async t => {
  let runAction = false;
  think.app = {
    controllers:{
      test:class TestController{
        __before(){
          return 'test'
        }
      }
    }
  };
  await controller.action('test','test');
  t.is(runAction,false);
});


