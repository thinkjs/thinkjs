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
  body:'hello thinkjs',
  status:404,
  ip:'10.10.10.10',
  ips: '10.10.10.10,11.11.11.11',
  module: {},
  method: 'GET',
  userAgent:'test',
  referrer(onlyHost){
    return onlyHost
  },
  referer(onlyHost){
    return onlyHost
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
// const controller = new think.Controller(ctx);
app.parseArgv = ()=>{return {port:8362}};
app.run();

test.serial('get/set body', async t => {
  // console.log(think.app.context)
});
