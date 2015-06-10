'use strict';

import url from 'url';

/**
 * route rules:
 * [
 *   [/^user\/(\d+)/, 'home/user/detail?id=:1'],
 *   [/^usr\/(\d+)/, {
 *     get: 'home/user/detail?id=:1',
 *     post: 'home/user/delete?id=:1'
 *   }],
 *   ...
 * ]
 */

export default class extends think.middleware.base {
  /**
   * run
   * @return {Promise} []
   */
  async run(){
    if (!this.config('route_on')) {
      return this.parsePathname();
    }
    let routes = await think.route();
    return this.parse(routes);
  }
  /**
   * parse routes
   * @param  {Array} routes [routes]
   * @return {}        []
   */
  parse(routes){
    this.cleanPathname();
    let length = routes.length;
    let pathname = this.http.pathname;
    if (length === 0 || !pathname) {
      return this.parsePathname();
    }
    let match, item, route, rule;
    for(let i = 0; i < length; i++){
      item = routes[i];
      route = this.getRoute(item[1]);
      if (!route) {
        continue;
      }
      rule = item[0];
      //regexp route
      if (think.isRegexp(rule)) {
        match = pathname.match(rule);
        if (match) {
          this.parseRegExpRule(match, route);
          break;
        }
      }
      //is string route
      else if (this.checkUrlMatch(rule)) {
        this.parseRoute(route);
        break;
      }
    }
    this.parsePathname();
  }
  /**
   * remove / start | end of pathname
   * @return {} []
   */
  cleanPathname(){
    let pathname = this.http.pathname;
    if (pathname[0] === '/') {
      pathname = pathname.slice(1);
    }
    if (pathname.slice(-1) === '/') {
      pathname = pathname.slice(0, -1);
    }
    this.http.pathname = pathname;
  }
  /**
   * parse pathname
   * @return {} []
   */
  parsePathname(){
    let pathname = this.http.pathname;
    if (!pathname) {
      this.http.module = think.getModule();
      this.http.controller = think.getController();
      this.http.action = think.getAction();
      return;
    }
    let paths = pathname.split('/');
    let module, controller, action, err;
    if (!think.mini) {
      module = paths[0].toLowerCase();
      if (module && module !== think.dirname.common && think.module.indexOf(module) > -1) {
        paths.shift();
      }else{
        module = '';
      }
    }
    controller = paths.shift();
    action = paths.shift();

    this.parseExtPath(paths);

    this.http.module = think.getModule(module);
    this.http.controller = think.getController(controller);
    this.http.action = think.getAction(action);

    if (!this.http.controller) {
      err = new Error(think.message('CONTROLLER_INVALID', controller, this.http.url));
      return think.reject(err);
    }
    if (!this.http.action) {
      err = new Error(think.message('ACTION_INVALID', action, this.http.url));
      return think.reject(err);
    }
  }
  /**
   * parse extra path
   * @param  {Array} paths [extra path]
   * @return {}       []
   */
  parseExtPath(paths){
    if (paths.length === 0) {
      return;
    }
    if (!think.isArray(paths)) {
      if (paths[0] === '/') {
        paths = paths.slice(1);
      }
      paths = paths.split('/');
    }
    if (paths.length) {
      for(let i = 0, length = Math.ceil(paths.length) / 2; i < length; i++){
        this.http._get[paths[i * 2]] = paths[i * 2 + 1] || '';
      }
    }
  }
  /**
   * check url is match
   * @param  {String} rule [url rule]
   * @return {Boolean}      []
   */
  checkUrlMatch(rule){
    let pathname = this.http.pathname.split('/');
    rule = rule.split('/');
    let i = 0, length = rule.length, plength = pathname.length, item, pitem;
    //if rule lenth is more then pathname, it will be false
    if (length > plength) {
      return false;
    }
    let match = {};
    for(; i < length; i++){
      item = rule[i];
      pitem = pathname[i];
      if (item.indexOf(':') === 0) {
        match[item.slice(1)] = pitem;
      }else{
        if (pitem.toLowerCase() !== item.toLowerCase()) {
          return false;
        }
      }
    }
    //append match data to this.http._get
    for(let key in match){
      this.http._get[key] = Math[key];
    }
    if (plength > length) {
      this.parseExtPath(pathname.slice(length));
    }
    return true;
  }
  /**
   * get route
   * @param  {Object} route   []
   * @param  {Array} matches []
   * @return {[type]}         []
   */
  getRoute(route){
    if (think.isString(route)) {
      return route;
    }
    for(let method in route){
      if (method.toUpperCase().indexOf(this.http.method) > -1) {
        return route[method];
      }
    }
    return;
  }
  /**
   * parse route string
   * @param  {String} route []
   * @return {}       []
   */
  parseRoute(route){
    if (route.indexOf('?') > -1) {
      let urlInfo = url.parse(route, true);
      let query = urlInfo.query;
      for(let key in query){
        if (query[key] || !(key in this.http._get)) {
          this.http._get[key] = query[key];
        }
      }
      route = urlInfo.pathname;
      if (route[0] === '/') {
        route = route.slice(1);
      }
    }
    this.http.pathname = route;
  }
  /**
   * parse regexp rule
   * @param  {Array} matches  [route matches]
   * @param  {String | Object} route    [route]
   * @return {Boolean}          []
   */
  parseRegExpRule(matches, route){
    //replace :1, :2 in route
    //such as: group/detail?date=:1&groupId=:2&page=:3
    route = route.replace(/:(\d+)/g, (a, b) => (matches[b] || ''));
    let pathname = this.http.pathname.slice(matches[0].length);
    this.parseExtPath(pathname);
    this.parseRoute(route);
  }
}