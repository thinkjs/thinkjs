const helper = require('think-helper/pure');
const assert = require('think-helper/assert');
const pathToRegexp = require('path-to-regexp');

module.exports = class Middleware {
  /**
   * check url matched
   */
  createRegexp(match) {
    if (helper.isFunction(match)) return match;
    if (match) return pathToRegexp(match);
  }
  /**
   * check rule match
   */
  checkMatch(rule, ctx) {
    if (helper.isFunction(rule)) return rule(ctx);
    return rule.test(ctx.path);
  }
  /**
   * middleware rules(appPath/middleware.js):
   * module.exports = [
   *  'clean_pathname',
   * {
   *    handle: denyIp,
   *    options: {},
   *    enable: false,
   *    match: '',
   *    ignore: ''
   * },
   * ]
   */
  parse(middlewares = [], middlewarePkg = {}, app) {
    return middlewares
      .map((item) => {
        if (helper.isString(item)) {
          return {handle: item};
        }
        if (helper.isFunction(item)) {
          return {handle: () => item};
        }
        // Parsing replaces `handle` with the initialized middleware below. Clone
        // descriptors so a cached middleware config can safely be parsed again.
        return Object.assign({}, item);
      })
      .filter((item) => {
        return !('enable' in item) || item.enable;
      })
      .map((item) => {
        if (helper.isString(item.handle)) {
          item.handle = middlewarePkg[item.handle];
        }
        assert(helper.isFunction(item.handle), 'handle must be a function');
        const options = item.options || {};
        let handle = item.handle;
        // if options is a function, maybe want get options async
        // then hack a middleware handle, when app is ready, then get options & exec handle
        if (helper.isFunction(options)) {
          let ret = {};
          app.think.beforeStartServer(() => {
            return Promise.resolve(options()).then((data) => {
              ret = data;
            });
          });
          app.on('appReady', () => {
            handle = handle(ret, app);
          });
          item.handle = (ctx, next) => {
            return handle(ctx, next);
          };
        } else {
          item.handle = handle(options, app);
          // handle also be a function
          assert(
            helper.isFunction(item.handle),
            'handle must return a function'
          );
        }
        return item;
      })
      .map((item) => {
        if (!item.match && !item.ignore) {
          return item.handle;
        }

        // create regexp here for better performance
        const match = this.createRegexp(item.match);
        const ignore = this.createRegexp(item.ignore);

        // has match or ignore
        return (ctx, next) => {
          if (
            (match && !this.checkMatch(match, ctx)) ||
            (ignore && this.checkMatch(ignore, ctx))
          ) {
            return next();
          }
          return item.handle(ctx, next);
        };
      });
  }
};
