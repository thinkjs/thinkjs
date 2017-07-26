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
 * think env
 */
think.__defineGetter__('env', () => think.app.env);

/**
 * is cli mode
 */
think.isCli = false;
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

const getClass = function(type, name, m) {
  const mcls = think.app[type];
  let cls = null;
  if (think.app.modules.length) {
    if (mcls[m]) {
      cls = mcls[m][name];
    }
    if (!cls && m !== 'common' && mcls.common) {
      cls = mcls.common[name];
    }
  } else {
    cls = mcls[name];
  }
  return cls;
};
/**
 * get controller instance
 * @param {String} name 
 * @param {Object} ctx 
 * @param {String} m 
 */
think.controller = (name, ctx, m = 'common') => {
  const Cls = getClass('controllers', name, m);
  assert(Cls, `can not find controller:${name}`);
  return new Cls(ctx);
};

/**
 * service base class
 */
think.Service = class Service {};

/**
 * get service
 */
think.service = (name, m) => {
  return getClass('services', name, m);
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
