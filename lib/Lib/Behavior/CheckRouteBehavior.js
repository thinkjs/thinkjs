/**
 * 检测路由行为
 * 通过自定义路由识别到对应的URL上
 * @return {[type]} [description]
 */
var url = require('url');
var Dispatcher = thinkRequire('Dispatcher');

module.exports = Behavior(function(){
  'use strict';
  return {
    options: {
      'url_route_on': false, //是否开启自定义URL路由
      'url_route_rules': [] //自定义URL路由规则
    },
    run: function(){
      if (!this.options.url_route_on) {
        return false;
      }
      var routes = this.options.url_route_rules;
      var length = routes.length;
      if (length === 0) {
        return false;
      }
      var pathname = this.http.pathname;
      var match;
      for(var i = 0; i < length; i++){
        var route = routes[i];
        var rule = route[0];
        //正则路由
        if (isRegexp(rule)) {
          match = pathname.match(rule);
          if (match) {
            var result = this.parseRegExp(match, route[1], pathname);
            if (result) {
              return result;
            }
          }
        }else{
          //字符串路由
          match = this.checkUrlMatch(pathname, rule);
          if (match) {
            return this.parseRule(rule, route[1], pathname);
          }
        }
      }
      return false;
    },
    /**
     * 分割pathname
     * @param  {[type]} pathname [description]
     * @return {[type]}          [description]
     */
    split: function(pathname){
      var ret = [];
      var j = 0;
      pathname = pathname.split('/');
      for(var i = 0, length = pathname.length, item; i < length; i++){
        item = pathname[i].trim();
        if (item) {
          ret[j++] = item;
        }
      }
      return ret;
    },
    /**
     * 解析字符串路由
     * @param  {[type]} rule     [description]
     * @param  {[type]} route    [description]
     * @param  {[type]} pathname [description]
     * @return {[type]}          [description]
     */
    parseRule: function(rule, route, pathname){
      route = this.getRoute(route);
      if (!route) {
        return false;
      }
      pathname = this.split(pathname);
      rule = this.split(rule);
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
      pathname = this.split(pathname);
      rule = this.split(rule);
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
      if (urlInfo.query) {
        for(var key in urlInfo.query){
          if (urlInfo.query[key] || !(key in this.http.get)) {
            this.http.get[key] = urlInfo.query[key];
          }
        }
      }
      var pathname = urlInfo.pathname || '';
      // 过滤调用pathname最后有/的情况
      pathname = this.split(pathname);
      this.http.action = Dispatcher.getAction(pathname.pop());
      this.http.controller = Dispatcher.getController(pathname.pop());
      this.http.group = Dispatcher.getGroup(pathname.pop());
    },
    /**
     * 获取route
     * @param  {[type]} route [description]
     * @return {[type]}       [description]
     */
    getRoute: function(route, matches){
      if (isObject(route)) {
        //对应的请求类型
        for(var method in route){
          //由于请求类型没有包含关系，这里可以直接用indexOf判断
          if (method.toUpperCase().indexOf(this.http.method) > -1) {
            return route[method];
          }
        }
        return;
      }
      var routeUpper = route.toUpperCase();
      //RESTFUL API
      if (routeUpper === 'RESTFUL' || routeUpper.indexOf('RESTFUL:') === 0) {
        var group = route.split(':')[1] || C('restful_group');
        route = group + '/' + matches[1] + '/' + this.http.method.toLowerCase() + '?resource=' + matches[1];
        if (matches[2]) {
          route += '&id=' + matches[2];
        }
        //设置变量到http对象上，方便后续使用
        this.http.isRestful = true;
        return route;
      }
      return route;
    },
    /**
     * 正则匹配路由
     * @param  {[type]} matches  [description]
     * @param  {[type]} route    [description]
     * @param  {[type]} pathname [description]
     * @return {[type]}          [description]
     */
    parseRegExp: function(matches, route, pathname){
      route = this.getRoute(route, matches);
      if (!route) {
        return false;
      }
      //替换路由字符串里的:1, :2 匹配都的值
      //如：group/detail?date=:1&groupId=:2&page=:3
      route = route.replace(/:(\d+)/g, function(a, b){
        return matches[b] || '';
      });
      pathname = pathname.replace(matches[0], '');
      pathname = this.split(pathname);
      //将剩余的pathname分割为querystring
      if (pathname.length) {
        for(var i = 0,length = Math.ceil(pathname.length)/2; i < length; i++){
          this.http.get[pathname[i * 2]] = pathname[i * 2 + 1] || '';
        }
      }
      this.parseUrl(route);
      return true;
    }
  };
});