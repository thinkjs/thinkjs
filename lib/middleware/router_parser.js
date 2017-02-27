const helper = require('think-helper');
const debug = require('debug')('think:middleware:router_parser');
const querystring = require('querystring');
/**
 * default options
 */
const defaultOptions = {
  defaultModule: 'home',
  defaultController: 'index',
  defaultAction: 'index',
  prefix: [], // url prefix
  suffix: ['.html'], // url suffix
  enableDefaultRouter: true,
  subdomainOffset: 2,
  subdomain: {}, //subdomain
  denyModules: [] //enable in multi module
}
/**
 * rules = [
 *  {match: '', path: '', method: ''}
 * ]
 * 
 * rules = {
 *  admin: {
 *    match: '',
 *    rules: [
 *      {match: '', path: '', method: ''}
 *    ]
 *  }
 * }
 */
class RouterParser {
  constructor(ctx, next, options){
    this.ctx = ctx;
    this.next = next;
    this.options = options;
    this.isMultiModule = think.isMultiModule;
    this.modules = think.modules;
    this.controllers = think.data.controller;
    this.pathname = this.getPathname();
  }
  /**
   * get pathname, remove prefix & suffix
   */
  getPathname(){
    let pathname = this.ctx.path;
    const prefix = this.options.prefix;
    //remove prefix in pathname
    if(prefix && prefix.length){
      prefix.some(item => {
        if(helper.isString(item) && pathname.indexOf(item) === 0){
          pathname = pathname.slice(item.length);
          return true;
        }
        if(helper.isRegExp(item) && item.test(pathname)){
          pathname = pathname.replace(item, '');
          return true;
        }
      });
    }
    //remove suffix in pathname
    const suffix = this.options.suffix;
    if(suffix && suffix.length){
      suffix.some(item => {
        if(helper.isString(item) && pathname.endsWith(item)){
          pathname = pathname.slice(0, pathname.length - item.length);
          return true;
        }
        if(helper.isRegExp(item) && item.test(pathname)){
          pathname = pathname.replace(item, '');
          return true;
        }
      });
    }
    //deal subdomain
    let subdomain = this.options.subdomain;
    if(!helper.isEmpty(subdomain)){
      let subdomainStr = this.ctx.subdomains().join(',');
      if(subdomainStr && subdomain[subdomainStr]){
        if(pathname[0] === '/'){
          pathname = '/' + subdomain[subdomainStr] + pathname;
        }else{
          pathname = subdomain[subdomainStr] + '/' + pathname;
        }
      }
    }
    return pathname;
  }
  /**
   * get path match
   */
  getPathMatch(pathname, match){
    if(helper.isRegExp(match)){
      return pathname.match(match);
    }
    // /name/:id
    if(match.indexOf(':') > -1){
      match = match.split('/');
      pathname = path.split(/\/+/);
      let ret = {};
      let flag = match.every((item, index) => {
        if(!item) return true;
        if(item[0] === ':'){
          if(pathname[index]){
            ret[item.slice(1)] = pathname[index];
            return true;
          }
        }else{
          if(item === pathname[index]){
            return true;
          }
        }
      });
      return flag ? ret : false;
    }
    return pathname.replace(/^\/|\/$/g, '') === match.replace(/^\/|\/$/g, '');
  }
  /**
   * home page
   */
  homePage(){
    this.ctx.module = this.isMultiModule ? this.options.defaultModule : '';
    this.ctx.controller = this.options.defaultController;
    this.ctx.action = this.options.defaultAction;
    debug(`RouterParser: path=${this.ctx.path}, module=${this.ctx.module}, controller=${this.ctx.controller}, action=${this.ctx.action}`);
    return this.next();
  }
  /**
   * get router rules
   */
  getRules(){
    let rules = think.data.router;
    if(this.isMultiModule && helper.isObject(rules)){
      for(let m in rules){
        let match = rules[m].match;
        if(match && this.getPathMatch(this.pathname, match)){
          this.ctx.module = m; // set module
          return rules[m].rules || [];
        }
      }
      return [];
    }
    return rules;
  }
  /**
   * detect rule match
   */
  getMatchedRule(rules){
    let rule = '';
    let specialMethods = ['redirect', 'resource'];
    const method = this.ctx.method.toLowerCase();
    rules.some(item => {
      if(item.method && specialMethods.indexOf(item.method) === -1){
        //check method matched
        if(item.method !== method) return;
      }
      let match = this.getPathMatch(this.pathname, item.match);
      if(!match) return;
      // /xxx/:id => {id: '123'}
      if(helper.isObject(match)){
        rule = Object.assign({}, item, {query: match});
      }else if(helper.isArray(match)){ // /name\/(\d+)/ => 'index/name?id=:1'
        rule = Object.assign({}, item, {
          path: item.path.replace(/\:(\d+)/g, (a, index) => {
            return match[index];
          })
        });
      }else {
        rule = item;
      }
      return true;
    });
    return rule;
  }
  /**
   * parser item rule
   */
  parseRule(rule){
    // redirect url
    if(rule.method === 'redirect'){
      if(rule.statusCode){
        this.ctx.status = rule.statusCode;
      }
      return this.ctx.redirect(rule.path);
    }
    let pathname = rule.path.replace(/^\/|\/$/g, '').replace(/\/{2,}/g, '/');
    let query = {};
    let queryPos = pathname.indexOf('?');
    if(queryPos > -1){
      query = querystring.parse(pathname.slice(queryPos + 1));
      pathname = pathname.slice(0, queryPos);
    }
    let m = ''; // module
    // multi module application, parse module first
    let controllers = this.controllers;
    if(this.isMultiModule){
      let pos = pathname.indexOf('/');
      m = pos === -1 ? pathname : pathname.slice(0, pos);
      if(this.modules.indexOf(m) > -1 && m !== 'common' && this.options.denyModules.indexOf(m) === -1){
        pathname = pos === -1 ? '' : pathname.slice(pos + 1);
      }else{
        m = this.options.defaultModule;
      }
      controllers = controllers[m] || {};
    }
    let controller = '';
    for(let name in controllers){
      if(name.indexOf('/') === -1) break;
      if(name === pathname || pathname.indexOf(`${name}/`) === 0){
        controller = name;
        pathname = pathname.slice(name.length + 1);
        break;
      }
    }
    let action = '';
    pathname = pathname.split('/');
    if(controller){
      action = pathname[0];
    }else{
      controller = pathname[0];
      action = pathname[1];
    }
    this.ctx.module = m;
    this.ctx.controller = controller || this.options.defaultController;
    this.ctx.action = action || this.options.defaultAction;
    this.ctx.routerQuery = query;
    debug(`RouterParser: path=${this.ctx.path}, module=${this.ctx.module}, controller=${this.ctx.controller}, action=${this.ctx.action}`);
    return this.next();
  }
  /**
   * parse router
   */
  run(){
    if(this.pathname === '' || this.pathname === '/'){
      return this.homePage();
    }
    const matchedRule = this.getMatchedRule(this.getRules());
    if(matchedRule){
      return this.parseRule(matchedRule);
    }
    if(this.options.enableDefaultRouter){
      return this.parseRule({path: this.pathname});
    }
    return this.next();
  }
}
/**
 * parse router
 */
module.exports = function parseRouter(options){
  options = Object.assign(defaultOptions, options);
  //set subdomain offset
  if(options.subdomainOffset){
    think.app.subdomainOffset = options.subdomainOffset;
  }
  //change subdomain array to object
  //subdomain: ['admin', 'user'] => {admin: 'admin', user: 'ussr'}
  if(helper.isArray(options.subdomain)){
    let subdomain = {};
    options.subdomain.forEach(item => {
      subdomain[item] = item;
    });
    options.subdomain = subdomain;
  }
  return (ctx, next) => {
    let instance = new RouterParser(ctx, next, options);
    return instance.run();
  } 
};