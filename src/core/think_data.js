'use strict';
/**
 * global thinkData, for store config, hook, route, alias etc
 * @type {Object}
 */
global.thinkData = {};
/**
 * store hook list
 * @type {Object}
 */
thinkData.hook = {};
/**
 * store module config
 * @type {Object}
 */
thinkData.config = {};
/**
 * module alias
 * @type {Object}
 */
thinkData.alias = {};
/**
 * module exports object
 * @type {Object}
 */
thinkData.export = {};
/**
 * store route
 * default is null, can not set [] or {}
 * @type {Object}
 */
thinkData.route = null;
/**
 * store middleware, which dynamic registed
 * @type {Object}
 */
thinkData.middleware = {};
/**
 * store system error message
 * message in file `config/sys/error.js`
 */
thinkData.error = {};
/**
 * store template file list, for check template file exist in view class
 * @type {Object}
 */
thinkData.template = {};
/**
 * store sorted controllers in module, for parse route which support sub controllers
 * {
 *   home: ['test/index']
 * }
 * @type {Object}
 */
thinkData.subController = {};