/**
 * 路由调配
 * @type {Object}
 */
var url = require("url");
var path = require("path");

var Dispatcher = module.exports = Class(function(){
    return {
        http: null,
        init: function(http){
            this.http = http;
        },
        run: function(){
            var _group = _module = _action = "";
            tag("path_info", this.http);
            var pathname = this.http.req.pathname;
            var extname = path.extname(pathname);
            if (extname == C('url_html_suffix')) {
                pathname = path.dirname(pathname) + "/" + path.basename(pathname, C('url_html_suffix'));
            }; 
            pathname = pathname.split("/").filter(function(item){
                item = item.trim();
                if (item) {
                    return item;
                };
            }).join("/");
            //去除pathname前缀
            if (C('pathname_prefix') && pathname.indexOf(C('pathname_prefix')) === 0) {
                pathname = pathname.substr(C('pathname_prefix').length);
            };
            this.http.req.pathname = pathname;
            if (pathname == 'favicon.ico') {
                throw_error("favicon.ico");
                return false;
            };
            if (!this.routerCheck()) {
                var paths = pathname.split("/");
                var groupList = C('app_group_list') || [];
                if (groupList.length) {
                    if (groupList.indexOf(paths[0])) {
                        _group = paths.shift();
                    };
                };
                var deny = C('app_group_deny') || [];
                if (_group && deny.length) {
                    if (deny.indexOf(_group)) {
                        throw new Error("");
                    };
                };
                _module = paths.shift();
                _action = paths.shift();
                if (paths.length) {
                    for(var i = 0,length = Math.ceil(paths.length)/2; i < length; i++){
                        this.http.req.query[paths[i*2]] = paths[i*2+1] || "";
                    }
                };
                this.http.req.group = Dispatcher.getGroup(_group);
                this.http.req.module = Dispatcher.getModule(_module);
                this.http.req.action = Dispatcher.getAction(_action);
            };
            return true;
        },
        routerCheck: function(){
            return tag('route_check', this.http);
        }
    }
});

Dispatcher.getModule = function(module){
    module = module || C('default_module');
    if (C('url_module_map')[module]) {
        return C('url_module_map')[module];
    };
    return ucfirst(module);
};
Dispatcher.getAction = function(action){
    action = action || C('default_action');
    if (C('url_action_map')[action]) {
        return C('url_action_map')[action];
    };
    return action;
};
Dispatcher.getGroup = function(group){
    group = group || C('default_group');
    return ucfirst(group);
}