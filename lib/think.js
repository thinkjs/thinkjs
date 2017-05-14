const Koa = require('koa');
const helper = require('think-helper');
const pkg = require('../package.json');
const bluebird = require('bluebird');
const assert = require('assert');
const fs = require('fs');
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
  constructor(ctx){
    this.ctx = ctx;
  }
}

/**
 * base logic class
 */
think.Logic = class Logic extends think.Controller {};