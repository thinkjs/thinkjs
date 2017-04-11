'use strict';

const debug = require('debug')('think-resource');
const resolve = require('path').resolve;
const assert = require('assert');
const send = require('koa-send');
const helper = require('think-helper');

/**
 * defaultOptions
 * @type {{root: string, index: string, hidden: boolean, format: boolean, gzip: boolean, extensions: boolean, maxage: number, setHeaders: boolean}}
 */
const defaultOptions = {
  root: '',
  index: 'index.html',
  hidden: false,
  format: false,
  gzip: false,
  extensions: false,
  maxage: 0,
  setHeaders: false
}

/**
 * serve wrapper by koa-send
 * @param options
 * @returns {serve}
 */
module.exports = function (options) {
  options = helper.extend({}, defaultOptions, options || {});

  const root = options.root;
  assert(options.root, 'root directory is required to serve files');
  debug('static "%s" %j', root, options);
  options.root = resolve(root);

  /**
   * serve
   */
  return function serve(ctx, next){
    if (ctx.method === 'HEAD' || ctx.method === 'GET') {
      return send(ctx, ctx.path, options).then(done => {
        if (!done) {
          return next();
        }
      });
    }
    return next();
  };
}