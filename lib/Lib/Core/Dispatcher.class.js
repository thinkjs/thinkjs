var url = require("url");
var path = require("path");
/**
 * 路由调配
 * @type {Object}
 */
var Dispatcher = module.exports = Class(function(){
    return {
        init: function(http){
            this.http = http;
        },
        run: function(){
            var group = "";
            var controller = "";
            var action = "";
            tag("path_info", this.http);
            var pathname = this.http.pathname;
            //URL后缀
            var extname = path.extname(pathname);
            //判断URL后缀
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
            this.http.pathname = pathname;

            //使用自定义路由
            if (this.routeCheck()) {
                return true;
            };
            //使用默认路由
            var paths = pathname.split("/");
            //将group list变为小写
            var groupList = (C('app_group_list') || []).map(function(item){
                return item.toLowerCase();
            });
            if (groupList.length) {
                if (groupList.indexOf((paths[0] + "").toLowerCase()) > -1) {
                    group = paths.shift();
                };
            };
            var deny = C('app_group_deny') || [];
            if (group && deny.length) {
                if (deny.indexOf(group) > -1) {
                    throw_error(group + " is not allowed", this.http);
                };
            };
            controller = paths.shift();
            action = paths.shift();
            if (paths.length) {
                for(var i = 0,length = Math.ceil(paths.length)/2; i < length; i++){
                    this.http.get[paths[i * 2]] = paths[i * 2 + 1] || "";
                }
            };
            this.http.group = Dispatcher.getGroup(group);
            this.http.controller = Dispatcher.getController(controller);
            this.http.action = Dispatcher.getAction(action);
            return true;
        },
        /**
         * 自定义路由检测
         * @return {[type]} [description]
         */
        routeCheck: function(){
            return tag('route_check', this.http);
        }
    }
});

/**
 * 获取group
 * @param  {[type]} group [description]
 * @return {[type]}       [description]
 */
Dispatcher.getGroup = function(group){
    group = group || C('default_group');
    return ucfirst(group);
}
/**
 * 获取controller
 * @param  {[type]} controller [description]
 * @return {[type]}            [description]
 */
Dispatcher.getController = function(controller){
    controller = controller || C('default_controller');
    if (C('url_controller_map')[controller]) {
        return C('url_controller_map')[controller];
    };
    return ucfirst(controller);
};
/**
 * 获取action
 * @param  {[type]} action [description]
 * @return {[type]}        [description]
 */
Dispatcher.getAction = function(action){
    action = action || C('default_action');
    if (C('url_action_map')[action]) {
        return C('url_action_map')[action];
    };
    return action;
};