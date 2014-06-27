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
            pathname = pathname.split('/').filter(function(item){
                return item.trim();
            });
            rule = rule.split('/').filter(function(item){
                return item.trim();
            });
            var matches = {};
            rule.forEach(function(item){
                var pathitem = pathname.shift();
                if (item.indexOf(':') === 0) {
                    matches[item] = pathitem;
                }
            });
            //将剩余的pathname分割为querystring
            if (pathname.length) {
                for(var i = 0,length = Math.ceil(pathname.length)/2; i < length; i++){
                    this.http.get[pathname[i * 2]] = pathname[i * 2 + 1] || '';
                }
            }
            var values = Object.values(matches);
            route = route.replace(/:(\d+)/g, function(a, b){
                return values[b - 1] || '';
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
            pathname = pathname.split('/').filter(function(item){
                return item.trim();
            });
            rule = rule.split('/').filter(function(item){
                return item.trim();
            });
            return rule.every(function(item, i){
                if (item.indexOf(':') === 0) {
                    if (item.indexOf('\\') > -1) {
                        var type = item.substr(-1);
                        if (type === 'd' && !isNumberString(pathname[i])) {
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
            pathname = pathname.split('/').filter(function(item){
                return item.trim();
            });
            this.http.action = Dispatcher.getAction(pathname.pop());
            this.http.controller = Dispatcher.getController(pathname.pop());
            this.http.group = Dispatcher.getGroup(pathname.pop());
        },
        /**
         * 获取route
         * @param  {[type]} route [description]
         * @return {[type]}       [description]
         */
        getRoute: function(route){
            if (isObject(route)) {
                //对应的请求类型
                for(var method in route){
                    //由于请求类型没有包含关系，这里可以直接用indexOf判断
                    if (method.indexOf(this.http.method) > -1) {
                        return route[method];
                    }
                }
                return;
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
            route = this.getRoute(route);
            if (!route) {
                return false;
            }
            route = route.replace(/:(\d+)/g, function(a, b){
                return matches[b] || '';
            });
            pathname = pathname.replace(matches[0], '');
            pathname = pathname.split('/').filter(function(item){
                return item;
            });
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