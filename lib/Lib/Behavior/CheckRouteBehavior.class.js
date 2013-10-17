/**
 * 检测路由行为
 * 通过自定义路由识别到对应的URL上
 * @return {[type]} [description]
 */
var url = require("url");
var behavior = Behavior(function(){
    return {
        options: {
            'url_route_on': false, //是否开启自定义URL路由
            'url_route_rules': {} //自定义URL路由规则
        },
        run: function(){
            var pathname = __http.req.pathname;
            if (!pathname) {
                return true;
            };
            if (!this.options.url_route_on) {
                return false;
            };
            var routes = this.options.url_route_rules;
            if (Object.keys(routes).length == 0) {
                return false;
            };
            for(var rule in routes){
                var route = routes[rule];
                var reg = this.strToReg(rule);
                var match = null;
                if (reg) {
                    match = pathname.match(reg);
                };
                if ( reg && match) {
                    var result =  this.parseRegExp(match, route, pathname);
                    if (result) {
                        return result;
                    };
                }
                var match = this.checkUrlMatch(pathname, rule);
                if (match) {
                    return this.parseRule(rule, route, pathname);
                };
            }
        },
        parseRule: function(){

        },
        checkUrlMatch: function(pathname, rule){

        },
        parseUrl: function(urlInfo){
            urlInfo = url.parse(urlInfo, true);
            if (urlInfo.query) {
                __http.req.query = extend(__http.req.query, urlInfo.query);
            };
            var pathname = urlInfo.pathname || "";
            pathname = pathname.split("/");
            __http.req.action = pathname.pop();
            __http.req.module = pathname.pop();
            __http.req.group = pathname.pop();
        },
        parseRegExp: function(matches, route, pathname){
            if (typeof route == 'function') {
                route = route(matches, pathname);
            }else if (!is_string(route)) {
                var sRoute = '';
                //对应的请求类型
                for(var method in route){
                    var nmethod = method.split(",").filter(function(item){
                        item = item.trim();
                        return item;
                    });
                    if (nmethod.indexOf(__http.req.method) != -1) {
                        sRoute = route[method];
                        break;
                    };
                }
                if (!sRoute) {
                    return false;
                };
                route = sRoute;
            };
            route = route.replace(/:(\d+)/g, function(a, b){
                return matches[b] || "";
            });
            pathname = pathname.replace(matches[0], "");
            pathname = pathname.split("/").filter(function(item){
                return item;
            });
            //将剩余的pathname分割为querystring
            if (pathname.length) {
                for(var i = 0,length = Math.ceil(pathname.length)/2; i < length; i++){
                    __http.req.query[pathname[i * 2]] = pathname[i * 2 + 1] || "";
                }
            };
            this.parseUrl(route);
            return true;
        },
        strToReg: function(str){
            if (str.indexOf('/') !== 0) {
                return false;
            };
            var pos = str.lastIndexOf('/');
            var modifier = str.substr(pos + 1);
            if (modifier) {
                if (!(/^[igm]+$/.test(modifier))) {
                    return false;
                };
            };
            str = str.substr(1, pos - 1);
            str = str.replace(/\\/g, "\\\\");
            var reg = new RegExp(str, modifier);
            return reg;
        }
    }
});
module.exports = behavior;