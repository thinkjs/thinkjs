const Koa = require('koa');
const helper = require('think-helper');
const pkg = require('../package.json');
const bluebird = require('bluebird');
const assert = require('assert');
const fs = require('fs');

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

//think.env
think.__defineGetter__('env', () => {
  return think.app.env;
});

/**
 * add think to think.app
 */
think.app.think = think;

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
  const controllers = think.app.controllers;
  let cls = null;
  if(think.app.modules.length){
    if(controllers[m]){
      cls = controllers[m][controller];
    }
  }else{
    cls = controllers[controller];
  }
  assert(cls, `can not find controller:${controller}`);
  return new cls(ctx);
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
  assert(helper.isNumber(timeout), 'startServerTimeout must be a number');
  const timeoutPromise = helper.timeout(timeout).then(() => {
    const err = new Error(`waiting for start server timeout, time: ${timeout}ms`);
    return Promise.reject(err);
  });
  return Promise.race([promise, timeoutPromise]);
}