/* eslint-disable no-unused-vars */
const url = require('url');
const assert = require('assert');
const util = require('util');
const request = util.promisify(require('request'));
const helper = require('think-helper');
const debug = require('debug')('think-proxy');

const defaultOptions = {
  jar: false // proxy won't send cookie to real server, set `jar = true` to send it.
};

/**
 * proxy function
 * @param {Object} options
 * @param {Object} app
 */
// {host, match, map, suppressRequestHeaders, suppressResponseHeaders}
function proxy(options, app) {
  assert(helper.isEmpty(options), 'must hava options');
  assert(
    !helper.isArray(options) || !helper.isObject(options),
    'options must be an array or an object'
  );
  if (helper.isArray(options)) {
    options = options.map(opt => {
      return Object.assign({}, defaultOptions, opt);
    });
  } else {
    options = Object.assign({}, defaultOptions, options);
  }
  return async function(ctx, next) {
    const option = resolver(ctx.path, options);
    if (helper.isEmpty(option)) {
      await next();
    }
    let suppressRequestHeaders;
    let suppressResponseHeaders;
    if (helper.isArray(option.suppressRequestHeaders)) {
      suppressRequestHeaders = options.suppressRequestHeaders.map(item => item.toLowerCase());
    }
    if (helper.isArray(option.suppressResponseHeaders)) {
      suppressResponseHeaders = options.suppressResponseHeaders.map(item => item.toLowerCase());
    }
    console.log(option);
  };
}

// resolver :: (String -> Object) -> Object
function resolver(path, options) {
  return options[0];
}

// parseBody :: Any => Any
function parseBody(body) {}

module.exports = proxy;
