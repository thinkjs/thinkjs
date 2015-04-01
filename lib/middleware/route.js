'use strict';

var url = require('url');

module.exports = think.middleware({
  /**
   * route options
   * @type {Object}
   */
  options: {
    'route_on': false, 
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
    'route_rules': []
  },
  /**
   * run
   * @return {Promise} []
   */
  run: function(){
    if (!this.options.route_on) {
      return this.parsePathname();
    }
    var self = this;
    return Promise.resolve(think.route).then(function(routes){
      return self.parse(routes);
    })
  },
  /**
   * parse routes
   * @param  {Array} routes [routes]
   * @return {}        []
   */
  parse: function(routes){
    this.cleanPathname();
    var length = routes.length;
    var pathname = this.http.pathname;
    if (length === 0 || !pathname) {
      return this.parsePathname();
    }
    var match, item, route, rule;
    for(var i = 0; i < length; i++){
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
  },
  /**
   * remove / start | end of pathname
   * @return {} []
   */
  cleanPathname: function(){
    var pathname = this.http.pathname;
    if (pathname[0] === '/') {
      pathname = pathname.slice(1);
    }
    if (pathname.slice(-1) === '/') {
      pathname = pathname.slice(0, -1);
    }
    this.http.pathname = pathname;
  },
  /**
   * parse pathname
   * @return {} []
   */
  parsePathname: function(){
    var pathname = this.http.pathname;
    if (!pathname) {
      this.http.module = think.getModule();
      this.http.controller = think.getController();
      this.http.action = think.getAction();
      return;
    }
    var paths = pathname.split('/');
    var module, controller, action, err;
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
      return Promise.reject(err);
    }
    if (!this.http.action) {
      err = new Error(think.message('ACTION_INVALID', action, this.http.url));
      return Promise.reject(err);
    }
  },
  /**
   * parse extra path
   * @param  {Array} paths [extra path]
   * @return {}       []
   */
  parseExtPath: function(paths){
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
      for(var i = 0, length = Math.ceil(paths.length) / 2; i < length; i++){
        this.http._get[paths[i * 2]] = paths[i * 2 + 1] || '';
      }
    }
  },
  /**
   * check url is match
   * @param  {String} rule [url rule]
   * @return {Boolean}      []
   */
  checkUrlMatch: function(rule){
    var pathname = this.http.pathname.split('/');
    rule = rule.split('/');
    var i = 0, length = rule.length, plength = pathname.length, item, pitem;
    //if rule lenth is more then pathname, it will be false
    if (length > plength) {
      return false;
    }
    var match = {};
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
    for(var key in match){
      this.http._get[key] = Math[key];
    }
    if (plength > length) {
      this.parseExtPath(pathname.slice(length));
    }
    return true;
  },
  /**
   * get route
   * @param  {Object} route   []
   * @param  {Array} matches []
   * @return {[type]}         []
   */
  getRoute: function(route){
    if (think.isString(route)) {
      return route;
    }
    for(var method in route){
      if (method.toUpperCase().indexOf(this.http.method) > -1) {
        return route[method];
      }
    }
    return;
  },
  /**
   * parse route string
   * @param  {String} route []
   * @return {}       []
   */
  parseRoute: function(route){
    if (route.indexOf('?') > -1) {
      var urlInfo = url.parse(route, true);
      var query = urlInfo.query;
      for(var key in query){
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
  },
  /**
   * parse regexp rule
   * @param  {Array} matches  [route matches]
   * @param  {String | Object} route    [route]
   * @return {Boolean}          []
   */
  parseRegExpRule: function(matches, route){
    //replace :1, :2 in route
    //such as: group/detail?date=:1&groupId=:2&page=:3
    route = route.replace(/:(\d+)/g, function(a, b){
      return matches[b] || '';
    });
    var pathname = this.http.pathname.slice(matches[0].length);
    this.parseExtPath(pathname);
    this.parseRoute(route);
  }
});