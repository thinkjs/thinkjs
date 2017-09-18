const helper = require('think-helper');
const debug = require('debug')('think-router');
const querystring = require('querystring');
const assert = require('assert');
/**
 *
 * rules = [
 *    ['/index', 'test', 'get']
 * ]
 *
 * rules = [
 *  {
 *    match: /match/,
 *    rules: [match, path, method, options]
 *  }
 * ]
 *
 * rules = [
 *  {
 *    match: /match/,
 *    rules: [match, path, method, options]
 *  },
 *  ['/index', 'test', 'get']
 * ]
 *
 *
 * rules = {
 *  admin: {
 *    match: '',
 *    rules: [
 *      ['/index', 'test', 'get']
 *    ]
 *  }
 * }
 */
class Router {
  /**
   * constructor
   * @param {Object} ctx koa ctx
   * @param {Function} next  koa next
   * @param {Object} options middleware options
   */
  constructor(ctx, next, options) {
    this.ctx = ctx;
    this.next = next;
    this.options = options;
    this.modules = this.ctx.app.modules;
    this.controllers = this.ctx.app.controllers;
    this.pathname = this.getPathname();
    this.rules = this.ctx.app.routers;
    this.ctxMethod = ctx.method.toUpperCase();
  }
  /**
   * get pathname, remove prefix & suffix
   */
  getPathname() {
    let pathname = this.ctx.path || '';
    const prefix = this.options.prefix;
    // remove prefix in pathname
    if (prefix && prefix.length) {
      prefix.some(item => {
        if (helper.isString(item) && pathname.indexOf(item) === 0) {
          pathname = pathname.slice(item.length);
          return true;
        }
        if (helper.isRegExp(item) && item.test(pathname)) {
          pathname = pathname.replace(item, '');
          return true;
        }
      });
    }
    // remove suffix in pathname
    const suffix = this.options.suffix;
    if (suffix && suffix.length) {
      suffix.some(item => {
        if (helper.isString(item) && pathname.endsWith(item)) {
          pathname = pathname.slice(0, pathname.length - item.length);
          return true;
        }
        if (helper.isRegExp(item) && item.test(pathname)) {
          pathname = pathname.replace(item, '');
          return true;
        }
      });
    }
    // deal subdomain
    const subdomain = this.options.subdomain;
    if (!helper.isEmpty(subdomain)) {
      const subdomainStr = this.ctx.subdomains.join(',');
      if (subdomainStr && subdomain[subdomainStr]) {
        if (pathname[0] === '/') {
          pathname = '/' + subdomain[subdomainStr] + pathname;
        } else {
          pathname = subdomain[subdomainStr] + '/' + pathname;
        }
      }
    }
    return pathname;
  }

  /**
   * get router rules
   */
  getRules() {
    const rules = this.rules;
    if (this.modules.length === 0) {
      return this.rules;
    } else if (this.modules.length && helper.isObject(rules)) {
      for (const m in rules) {
        const match = rules[m].match;
        if (match) {
          assert(helper.isRegExp(match), 'router.match must be a RegExp');
          if (match.test(this.pathname)) {
            this.ctx.module = m;
            return rules[m].rules || [];
          }
        }
      }
      return [];
    }
    return rules;
  }
  /**
   * detect rule match
   */
  getMatchedRule(rules) {
    let rule;
    const specialMethods = ['REDIRECT', 'REST'];
    rules.some(item => {
      if (!item.rules) {
        const itemMethod = item.method;
        if (itemMethod && specialMethods.indexOf(itemMethod) === -1) {
          // check method matched
          if (itemMethod.indexOf(this.ctxMethod) === -1) return;
        }
        assert(helper.isRegExp(item.match), 'router.match must be a RegExp');
        const match = item.match.exec(this.pathname);
        if (!match) return;
        assert(helper.isArray(item.query), 'router.query must be an array');
        const query = {};
        let pathname = item.path || this.pathname;

        item.query.forEach((queryItem, index) => {
          if (/^\d+$/.test(queryItem.name)) {
            const index = parseInt(queryItem.name) + 1;
            pathname = pathname.replace(`:${index}`, match[index] || '');
          } else {
            query[queryItem.name] = match[index + 1];
            pathname = pathname.replace(`:${queryItem.name}`, query[queryItem.name]);
          }
        });
        rule = Object.assign({}, item, {query, path: pathname});
        return true;
      } else {
        const multiMatch = item.match.exec(this.pathname);
        if (!multiMatch) return;
        rule = this.getMatchedRule(item.rules);
      }
    });
    return rule;
  }

  /**
    parse controllers
   */
  parseController(pathname, controllers) {
    let controller = '';
    for (const name in controllers) {
      if (name.indexOf('/') === -1) break;
      if (name === pathname || pathname.indexOf(`${name}/`) === 0) {
        controller = name;
        pathname = pathname.slice(name.length + 1);
        break;
      }
    }
    return { controller, pathname };
  }

  /**
   * parser item rule
   */
  parseRule(rule) {
    const ruleMethod = rule.method;
    // redirect url
    if (ruleMethod === 'REDIRECT') {
      if (rule.options && rule.options.statusCode) {
        this.ctx.status = rule.options.statusCode;
      }
      return this.ctx.redirect(rule.path);
    }
    // remove needless `/` in pathname
    let pathname = rule.path.replace(/^\/|\/$/g, '').replace(/\/{2,}/g, '/');
    let query = rule.query || {};
    const queryPos = pathname.indexOf('?');
    // parse query in path
    if (queryPos > -1) {
      query = Object.assign(query, querystring.parse(pathname.slice(queryPos + 1)));
      pathname = pathname.slice(0, queryPos);
    }
    // remove when query value is undefined or empty string
    for (const name in query) {
      if (query[name] === undefined || query[name].trim() === '') {
        delete query[name];
      }
    }

    let m = ''; // module
    // multi module application, parse module first
    let controllers = this.controllers;
    if (this.modules.length) {
      const pos = pathname.indexOf('/');
      m = pos === -1 ? pathname : pathname.slice(0, pos);
      if (this.modules.indexOf(m) > -1 && m !== 'common' && this.options.denyModules.indexOf(m) === -1) {
        pathname = pos === -1 ? '' : pathname.slice(pos + 1);
      } else {
        m = this.options.defaultModule;
      }
      controllers = controllers[m] || {};
    }

    let controller = '';
    let parseControllerResult = this.parseController(pathname, controllers);
    controller = parseControllerResult.controller;
    pathname = parseControllerResult.pathname;
    if (!controller) {
      parseControllerResult = this.parseController(`${pathname}/${this.options.defaultController}`, controllers);
      controller = parseControllerResult.controller;
      pathname = parseControllerResult.pathname;
    }

    let action = '';
    pathname = pathname.split('/');
    if (controller) {
      action = ruleMethod === 'REST' ? this.ctxMethod.toLowerCase() : pathname[0];
    } else {
      controller = pathname[0];
      action = ruleMethod === 'REST' ? this.ctxMethod.toLowerCase() : pathname[1];
    }

    this.ctx.module = m;
    this.ctx.controller = controller || this.options.defaultController;
    this.ctx.action = action || this.options.defaultAction;
    // add query to context
    this.ctx.param(query);
    debug(`RouterParser: path=${this.ctx.path}, module=${this.ctx.module}, controller=${this.ctx.controller}, action=${this.ctx.action}, query=${JSON.stringify(query)}`);
    return this.next();
  }
  /**
   * parse router
   */
  run() {
    const pathname = this.pathname;
    // ignore user defined rules for home page request, optimize request performance
    // default home page pathname is `/`, when user define prefix, it may be an empty string
    if (this.options.optimizeHomepageRouter && (pathname === '' || pathname === '/')) {
      this.ctx.module = this.modules.length ? this.options.defaultModule : '';
      this.ctx.controller = this.options.defaultController;
      this.ctx.action = this.options.defaultAction;
      debug(`RouterParser: path=${this.ctx.path}, module=${this.ctx.module}, controller=${this.ctx.controller}, action=${this.ctx.action}`);
      return this.next();
    }
    const rules = this.getRules();
    const matchedRule = this.getMatchedRule(rules);
    if (matchedRule) {
      debug(`matchedRule: ${JSON.stringify(matchedRule)}`);
      return this.parseRule(matchedRule);
    }
    if (this.options.enableDefaultRouter) {
      return this.parseRule({path: this.pathname});
    }
    return this.next();
  }
}

module.exports = Router;
