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
 * @type {Object}
 */
thinkData.route = {};
/**
 * store middleware, which dynamic registed
 * @type {Object}
 */
thinkData.middleware = {};
/**
 * store system error message
 * message in file `config/sys/error.js`
 */
thinkData.error = {}