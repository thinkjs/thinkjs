const Koa = require('koa');
const helper = require('think-helper');
const path = require('path');
const pkg = require('../package.json');

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
 * @return {}         []
 */
think.version = pkg.version;
