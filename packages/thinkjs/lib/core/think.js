const pkg = require('../../package.json');
const assert = require('think-helper/assert');

module.exports = function createThink(app, helper, messenger) {
  /**
   * global think object
   * @type {Object}
   */
  const think = Object.create(helper);
  Object.defineProperty(think, Symbol.for('thinkjs.core'), {value: true});

  /**
   * Application transport instance
   * @type {Object}
   */
  think.app = app;

  /**
   * think.env
   */
  Object.defineProperty(think, 'env', {
    get() {
      return think.app && think.app.env;
    }
  });

  /**
   * add think to think.app
   */
  if (app) app.think = think;

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
  think.beforeStartServer = (fn) => {
    if (fn) {
      assert(
        helper.isFunction(fn),
        'fn in think.beforeStartServer must be a function'
      );
      return promises.push(fn());
    }
    let timer;
    const timeout = helper.ms(think.config('startServerTimeout'));
    return Promise.race([
      Promise.all(promises),
      new Promise((resolve, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(`waiting for start server timeout, time: ${timeout}ms`)
            ),
          timeout
        );
      })
    ]).finally(() => clearTimeout(timer));
  };
  return think;
};
