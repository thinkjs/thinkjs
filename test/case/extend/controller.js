import test from 'ava';
const mock = require('mock-require');
const mockie = require('../../lib/mockie');
const utils = require('../../lib/utils');
// const path = require('path');

function getApplication() {
  return mock.reRequire('../../../lib/application');
}

function getController() {
  return mock.reRequire('../../../lib/extend/controller');
}

const defaultOption = {
  ROOT_PATH: __dirname,
  // APP_PATH: path.resolve(__dirname,'../runtime')
};

const ctx = {
  body:'hello thinkjs',
  ip:'10.10.10.10',
  ips:'10.10.10.10,11.11.11.11',
  module:{},
  method:'GET',
  isMethod(method){
    return method === this.method;
  },
  isGet:true,
  isPost:false,
  isCli:true,
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
      errno:0,
      data,
      errmsg:message||''
    }
  }
};

mockie.mockCluster(false);
mockie.mockThinkCluster({isFirstWorker:()=>{return true}});
const App = getApplication();
let app = new App(defaultOption);
const controller = new think.Controller(ctx);
app.parseArgv = ()=>{return {}};
app.run();

test.serial('get/set body', async t => {
  const body = 'hello thinkjs again';
  t.is(controller.body,ctx.body);
  controller.body = body;
  t.is(controller.body,body);
});

test.serial('get ip', async t => {
  t.is(controller.ip,ctx.ip);
});

test.serial('get ips', async t => {
  t.is(controller.ips,ctx.ips);
});

test.serial('config function', async t => {
  t.is(controller.config('port'), 8360);
  controller.config('port', 8361, ctx.module);
  t.is(controller.config('port'), 8361);
});

test.serial('get method', async t => {
  t.is(controller.method, ctx.method)
});

test.serial('isMethod method', async t => {
  t.is(controller.isMethod(ctx.method), true)
});

test.serial('get isGet', async t => {
  t.is(controller.isGet, true)
});

test.serial('get isPost', async t => {
  t.is(controller.isPost, false)
});

test.serial('isCli method', async t => {
  t.is(controller.isCli, true)
});

test.serial('isAjax method', async t => {
  t.is(controller.isAjax('GET'), true)
});

test.serial('jsonp method', async t => {
  t.is(controller.jsonp('callback'), 'callback')
});

test.serial('isJsonp method', async t => {
  t.is(controller.isJsonp('callback'), 'callback')
});

test.serial('json method', async t => {
  const obj = {
    name:'thinkjs'
  }
  t.deepEqual(controller.json(JSON.stringify(obj)), obj)
});

test.serial('success method', async t => {
  let data = {name:'thinkjs'}
  t.deepEqual(controller.success(data).data, data)
});