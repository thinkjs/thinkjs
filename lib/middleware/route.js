'use strict'

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
  run: function(){
    if (!this.options.route_on) {
      return this.parsePathname();
    }
    var routes = this.options.route_rules;
    //routes is funciton
    //such as: load routes from db
    if (think.isFunction(routes)) {
      var fn = think.co.wrap(fn);
      var self = this;
      return fn(this.http).then(function(routes){
        return self.parse(routes);
      })
    }
    return this.parse(routes);
  },
  /**
   * parse routes
   * @param  {Array} routes [routes]
   * @return {}        []
   */
  parse: function(routes){
    var length = routes.length;
    if (length === 0) {
      return this.parsePathname();
    }
    var pathname = this.http.pathname;
    var match;
    for(var i = 0; i < length; i++){
      var route = routes[i];
      var rule = route[0];
      //regexp route
      if (think.isRegexp(rule)) {
        match = pathname.match(rule);
        if (match && this.parseRegExpRule(match, route[1])) {
          break;
        }
      }
      //string route
      else if (this.checkUrlMatch(rule)) {};{
        break this.parseStringRule(rule, route[1]);
      }
    }
    this.parsePathname();
  },
  /**
   * parse pathname
   * @return {} []
   */
  parsePathname: function(){
    var paths = this.http.pathname.split('/');
    var module, controller, action;
    if (!think.mini) {
      module = paths[0].toLowerCase();
      if (module && module !== think.dirname.common && think.module.indexOf(module) > -1) {
        paths.shift();
      }
    }
    controller = paths.shift();
    action = paths.shift();
    if (paths.length) {
      for(var i = 0, length = Math.ceil(paths.length) / 2; i < length; i++){
        this.http._get[paths[i * 2]] = paths[i * 2 + 1] || '';
      }
    }
    this.http.module = think.getModule(module);
    this.http.controller = think.getController(controller);
    this.http.action = think.getAction(action);
    if (!this.http.controller) {
      var err = new Error('controller `' + controller + '` is not valid. url is `' + this.http.url + '`');
      return Promise.reject(err);
    }
    if (!this.http.action) {
      err = new Error('action `' + action + '` is not valid. url is `' + this.http.url + '`');
      return Promise.reject(err);
    }
  },
  /**
   * 解析字符串路由
   * @param  {[type]} rule     [description]
   * @param  {[type]} route    [description]
   * @param  {[type]} pathname [description]
   * @return {[type]}          [description]
   */
  parseStringRule: function(rule, route, pathname){
    route = this.getRoute(route);
    if (!route) {
      return false;
    }
    pathname = Dispatcher.splitPathName(pathname);
    rule = Dispatcher.splitPathName(rule);
    var matches = [];
    var self = this;
    rule.forEach(function(item){
      var pathitem = pathname.shift();
      if (item.indexOf(':') === 0) {
        if (item.indexOf('\\') === -1) {
          self.http.get[item.substr(1)] = pathitem;
        }else{
          matches.push(pathitem);
        }
      }
    });
    //将剩余的pathname分割为querystring
    if (pathname.length) {
      for(var i = 0,length = Math.ceil(pathname.length)/2; i < length; i++){
        this.http.get[pathname[i * 2]] = pathname[i * 2 + 1] || '';
      }
    }
    route = route.replace(/:(\d+)/g, function(a, b){
      return matches[b - 1] || '';
    });
    this.parseUrl(route);
    return true;
  },
  /**
   * 检测URL是否匹配
   * @param  {[type]} pathname [description]
   * @param  {[type]} rule     [description]
   * @return {[type]}          [description]
   */
  checkUrlMatch: function(pathname, rule){
    pathname = Dispatcher.splitPathName(pathname);
    rule = Dispatcher.splitPathName(rule);
    return rule.every(function(item, i){
      if (item.indexOf(':') === 0) {
        if (item.indexOf('\\') > -1) {
          var type = item.substr(-1);
          var reg;
          switch(type){
            case 'd':
              reg = /^\d+$/;
              break;
            case 'w':
              reg = /^\w+$/
              break;
          }
          if (reg && !reg.test(pathname[i])) {
            return false;
          }
        }
      }else{
        var pitem = pathname[i] || '';
        if (pitem.toLowerCase() !== item.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  },
  /**
   * 解析转化后的url
   * @param  {[type]} urlInfo [description]
   * @return {[type]}         [description]
   */
  parseUrl: function(urlInfo){
    urlInfo = url.parse(urlInfo, true);
    if (!isEmpty(urlInfo.query)) {
      for(var key in urlInfo.query){
        if (urlInfo.query[key] || !(key in this.http.get)) {
          this.http.get[key] = urlInfo.query[key];
        }
      }
    }
    // 过滤调用pathname最后有/的情况
    var pathname = Dispatcher.splitPathName(urlInfo.pathname);
    this.http.action = Dispatcher.getAction(pathname.pop());
    this.http.controller = Dispatcher.getController(pathname.pop());
    this.http.group = Dispatcher.getGroup(pathname.pop());
  },
  /**
   * get route
   * @param  {Object} route   []
   * @param  {Array} matches []
   * @return {[type]}         []
   */
  getRoute: function(route, matches){
    if (!think.isObject(route)) {
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
   * parse regexp rule
   * @param  {Array} matches  [route matches]
   * @param  {String | Object} route    [route]
   * @return {Boolean}          []
   */
  parseRegExpRule: function(matches, route){
    route = this.getRoute(route, matches);
    if (!route) {
      return false;
    }
    //replace :1, :2 in route
    //such as: group/detail?date=:1&groupId=:2&page=:3
    route = route.replace(/:(\d+)/g, function(a, b){
      return matches[b] || '';
    });
    pathname = pathname.replace(matches[0], '');
    pathname = Dispatcher.splitPathName(pathname);
    //将剩余的pathname分割为querystring
    if (pathname.length) {
      for(var i = 0,length = Math.ceil(pathname.length)/2; i < length; i++){
        this.http.get[pathname[i * 2]] = pathname[i * 2 + 1] || '';
      }
    }
    return true;
  }
});