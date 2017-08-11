const Koa = require('koa');
const helper = require('think-helper');
const pkg = require('../package.json');
const bluebird = require('bluebird');
const assert = require('assert');
const messenger = require('think-cluster').messenger;

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
 * think.env
 */
Object.defineProperty(think, 'env', {
  get() {
    return think.app.env;
  }
});

/**
 * add think to think.app
 */
think.app.think = think;

/**
 * thinkjs version
 */
think.version = pkg.version;

/**
 * messenger
 * @type {Object}
 */
think.messenger = messenger;

/**
 * base controller class
 */
think.Controller = class Controller {
  constructor(ctx) {
    this.ctx = ctx;
  }
};

/**
 * base logic class
 */
think.Logic = class Logic extends think.Controller {};

/**
 * service base class
 */
think.Service = class Service {};

/**
 * get service
 */
think.service = (name, m, ...args) => {
  let mcls = think.app.services;
  if (think.app.modules.length) {
    mcls = think.app.services[m || 'common'] || {};
  } else {
    args.unshift(m);
  }
  const Cls = mcls[name];
  assert(Cls, `can not find service: ${name}`);
  if (helper.isFunction(Cls)) return new Cls(...args);
  return Cls;
};

// before start server
const promises = [];
think.beforeStartServer = fn => {
  if (fn) {
    assert(helper.isFunction(fn), 'fn in think.beforeStartServer must be a function');
    return promises.push(fn());
  }
  const promise = Promise.all(promises);
  const timeout = helper.ms(think.config('startServerTimeout'));
  const timeoutPromise = helper.timeout(timeout).then(() => {
    const err = new Error(`waiting for start server timeout, time: ${timeout}ms`);
    return Promise.reject(err);
  });
  return Promise.race([promise, timeoutPromise]);
};
