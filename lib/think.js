const Koa = require('koa');
const helper = require('think-helper');
const path = require('path');
const pkg = require('../package.json');
const bluebird = require('bluebird');
const Loader = require('think-loader');
const getConfigFn = require('think-config').getConfigFn;
const assert = require('assert');
const fs = require('fs');
const Logger = require('think-logger');

// ThinkJS root path
const thinkPath = path.join(__dirname, '..');

/**
 * use bluebird instead of default Promise
 */
global.Promise = bluebird;

/**
 * global think object
 * @type {Object}
 */
global.think = Object.create(helper);

/**
 * Koa application instance
 * @type {Koa}
 */
think.app = new Koa();

/**
 * thinkjs version
 * @param  {) []
 * @return {String}     []
 */
think.version = pkg.version;

/**
 * base controller class
 */
think.Controller = class Controller {
  constructor(ctx){
    this.ctx = ctx;
  }
}

/**
 * get controller instance
 */
think.controller = (controller, ctx, m) => {
  
}

/**
 * base logic class
 */
think.Logic = class Logic extends think.Controller {};

/**
 * get logic instance
 */
think.logic = (logic, ctx, m) => {

}

// before start server
let promises = [];
think.beforeStartServer = fn => {
  if(fn) {
    assert(helper.isFunction(fn), 'fn in think.beforeStartServer must be a function');
    return promises.push(fn());
  }
  const promise = Promise.all(promises);
  const timeout = think.config('startServerTimeout');
  assert(help.isNumber(timeout), 'startServerTimeout must be a number');
  const timeoutPromise = helper.timeout(timeout).then(() => {
    const err = new Error(`waiting for start server timeout, time: ${timeout}ms`);
    return Promise.reject(err);
  });
  return Promise.race([promise, timeoutPromise]);
}




/**
 * load data
 */
const loadData = () => {
  let config = think.loader.loadConfig(think.app.env);
  let modules = think.loader.modules;

  think.config = getConfigFn(config, modules.length > 0);
  //add data to koa application
  think.app.modules = modules;
  think.app.controllers = think.loader.loadController();
  think.app.logics = think.loader.loadLogic();
  think.app.models = think.loader.loadModel();
  think.app.services = think.loader.loadService();
  think.app.routers = think.load.loadRouter();
}

/**
 * load middleware
 */
const loadMiddleware = () => {
  const middlewares = think.loader.loadMiddleware();
  middlewares.forEach(middleware => {
    think.app.use(middleware);
  });
}

/**
 * create think.logger
 */
const createLogger = () => {
  let config = helper.parseAdapterConfig(think.config('logger'));
  think.logger = new Logger(config);
}

/**
 * load extend
 */
const loadExtend = () => {
  let exts = think.loader.loadExtend();
  const list = [
    ['context', think.app.context],
    ['request', think.app.request],
    ['response', think.app.response],
    ['think', think, true],
    ['controller', think.Controller.prototype],
    ['logic', think.Logic.prototype]
  ];
  list.forEach(item => {
    if(!exts[item[0]]) return;
    if(item[2]){
      for(let t in exts[item[0]]){
        assert(!item[1][t], `${item[0]}.${t} can not override`);
        item[1][t] = exts[item[0]][t];
      }
    }else{
      item[1] = Object.assign(item[1], exts[item[0]]);
    }
  })
}

/**
 * init
 */
module.exports = options => {
  think.ROOT_PATH = options.ROOT_PATH;
  think.APP_PATH = options.APP_PATH;
  if(options.env){
    think.app.env = options.env;
  }
  if(options.proxy){
    think.app.proxy = options.proxy;
  }
  think.loader = new Loader(think.APP_PATH, thinkPath);
  loadData();
  loadMiddleware();
  loadExtend();
  createLogger();
}