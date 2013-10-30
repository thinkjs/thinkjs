/**
 * 路由调配
 * @type {Object}
 */
var url = require("url");
var path = require("path");


var _group = '';
var _module = '';
var _action = '';
var Dispatcher = {
    run: function(){
        tag("path_info");
        var pathname = __http.req.pathname;
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
        __http.req.pathname = pathname;
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
                    __http.req.query[paths[i*2]] = paths[i*2+1] || "";
                }
            };
            __http.req.group = this.getGroup();
            __http.req.module = this.getModule();
            __http.req.action = this.getAction();
        };
        return true;
    },
    routerCheck: function(){
        tag('route_check');
        return global.__behavior_value;
    },
    getModule: function(module){
        module = typeof module == 'undefined' ? _module : module;
        module = module || C('default_module');
        if (C('url_module_map')[module]) {
            __http.req.module_alias = module;
            return C('url_module_map')[module];
        };
        return ucfirst(module);
    },
    getAction: function(action){
        action = typeof action == 'undefined' ? _action : action;
        action = action || C('default_action');
        if (C('url_action_map')[action]) {
            __http.req.action_alias = action;
            return C('url_action_map')[action];
        };
        return action;
    },
    getGroup: function(group){
        group = typeof group == 'undefined' ? _group : group;
        group = group || C('default_group');
        return ucfirst(group);
    }
}
module.exports = Dispatcher;