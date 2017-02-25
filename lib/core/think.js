const Koa = require('koa');
const helper = require('think-helper');
const path = require('path');
const Await = require('think-await');
const pkg = require('../../package.json');
const bluebird = require('bluebird');
const Controller = require('./controller.js');
const Logic = require('./logic.js');
const Loader = require('think-loader');
const getConfigFn = require('think-config').getConfigFn;
const assert = require('assert');
const fs = require('fs');

// ThinkJS root path
const thinkPath = path.join(__dirname, '../..');

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
think.Controller = Controller;

/**
 * base logic class
 */
think.Logic = Logic;

/**
 * await
 */
think.await = Await;

/**
 * env
 */
think.env = 'development';

/**
 * module list, support multi module
 */
think.modules = [];
/**
 * is multi module
 */
think.isMultiModule = false;

/**
 * all cache data
 */
think.data = {};

/* ********************************************************************** */

/**
 * load data
 */
const loadData = () => {
  let config = think.loader.loadConfig(think.env);
  think.config = getConfigFn(config, think.isMultiModule);
  think.data = {
    controller: think.loader.loadController(),
    logic: think.loader.loadLogic(),
    model: think.loader.loadModel(),
    service: think.loader.loadService(),
    view: think.loader.loadView(think.VIEW_PATH),
    router: think.loader.loadRouter()
  }
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
 * load extend
 */
const loadExtend = () => {
  let exts = think.loader.loadExtend();
  const list = [
    ['context', think.app.context],
    ['request', think.app.request],
    ['response', think.app.response],
    ['think', think, true],
    ['controller', think.Controller.protoype],
    ['logic', think.Logic.protoype]
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
 * init application path
 */
const initPath = options => {
  assert(options.ROOT_PATH, 'ROOT_PATH must be set');
  think.ROOT_PATH = options.ROOT_PATH;
  think.APP_PATH = options.APP_PATH || path.join(think.ROOT_PATH, 'app');
  think.VIEW_PATH = options.VIEW_PATH || path.join(think.ROOT_PATH, 'view');
  think.RUNTIME_PATH = options.RUNTIME_PATH || path.join(think.ROOT_PATH, 'runtime');
  think.loader = new Loader(think.APP_PATH, thinkPath);
  think.modules = think.loader.modules;
  think.isMultiModule = think.modules.length > 0;
}
/**
 * init
 */
exports.init = options => {
  initPath(options);
}

exports.load = () => {
  loadData();
  loadMiddleware();
  loadExtend();
}
