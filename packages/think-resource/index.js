'use strict';

const debug = require('debug')('think-resource');
const resolve = require('path').resolve;
const assert = require('assert');
const helper = require('think-helper');
const send = require('koa-send');

/**
 * defaultOptions
 * @type {{root: string, publicPath: string, index: string, hidden: boolean, format: boolean, gzip: boolean, extensions: boolean, maxage: number, setHeaders: boolean}}
 */
const defaultOptions = {
  root: '',
  publicPath: '/',
  index: 'index.html',
  hidden: false,
  format: true,
  gzip: false,
  extensions: false,
  maxage: 0,
  setHeaders: false,
  notFoundNext: false
}

/**
 * prefix "/" for path
 * @param path
 * @returns {*}
 */
const prefixPath = (path) => {
  if (helper.isString(path) && !path.startsWith('/')) {
    path = '/' + path;
  }
  return path;
}

/**
 * match route
 * @param path
 * @param route
 * @returns {*}
 */
const matchRoute = (path, route) => {
  if (helper.isRegExp(route)) {
    return path.match(route);
  }
  if (helper.isString(route)) {
    route = route.split('/');
    path = path.split(/\/+/);
    return route.every((item, index) => {
      if (!item || item === path[ index ]) {
        return true;
      }
    });
  }
};

/**
 * serve wrapper by koa-send
 * @param options
 * @returns {serve}
 */
module.exports = function (options) {
  options = helper.extend({}, defaultOptions, options || {});

  const root = options.root;
  assert(root, 'root directory is required to serve files');
  debug('static "%s" %j', root, options);
  options.root = resolve(root);

  let publicPath = options.publicPath;
  assert(helper.isRegExp(publicPath) || helper.isString(publicPath), 'publicPath must be regexp or string')
  options.publicPath = prefixPath(publicPath);
  
  const notFoundNext = options.notFoundNext;

  /**
   * serve
   */
  return function serve (ctx, next) {
    if (matchRoute(ctx.path, options.publicPath) && (ctx.method === 'HEAD' || ctx.method === 'GET')) {
      return send(ctx, prefixPath(ctx.path), options).then(done => {
        if (!done && notFoundNext) {
          return next();
        }
      });
    }
    return next();
  };
}