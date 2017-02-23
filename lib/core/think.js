const Koa = require('koa');
const helper = require('think-helper');
const path = require('path');
const pkg = require('../../package.json');
const bluebird = require('bluebird');
const Controller = require('./controller.js');
const Logic = require('./logic.js');

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
 * env
 */
think.env = 'development';

/**
 * module list, support multi module
 */
think.modules = [];
