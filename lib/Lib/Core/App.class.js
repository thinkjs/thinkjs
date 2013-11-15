/**
 * 应用程序
 * @type {Object}
 */
var cluster = require("cluster");
var App = module.exports = Class(function(){
    return {
        http: null,
        init: function(http){
            this.http = http;
            this.loadExtFile();
            this.loadExtConfig();
            //路径解析
            think_require('Dispatcher')(http).run();
            tag ('url_dispatch', http);
        },
        exec: function(){
            var group = this.http.group;
            var controller = '';
            var self = this;
            //检测controller名
            if (!(/^[A-Za-z](\w)*$/.test(this.http.controller))) {
                controller = '';
            }else{
                try{
                    controller = A(group + "/" + this.http.controller, this.http);
                }catch(e){}
            }
            if (!controller) {
                try{
                    controller = A(group + "/" + "Empty", this.http);
                }catch(e){}
                if (!controller) {
                    throw_error(this.http.controller + " controller not found", this.http);
                };
            };
            var action = this.http.action;
            var oldAction = action;
            //添加action后缀
            if (C('action_suffix')) {
                action += C('action_suffix');
            };
            //action黑名单
            if (C('action_name_black_list').length) {
                var flag = C('action_name_black_list').some(function(item){
                    if (is_string(item) && item == action) {
                        return true;
                    }else if(item && item.test && item.test(action)){
                        return true;
                    }
                    return false;
                })
                if (flag) {
                    throw_error("action black", this.http);
                };
            };
            //检测action名
            if (!/^[A-Za-z](\w)*$/.test(action)) {
                throw_error('action name error', this.http);
            };
            if (typeof controller[action] == 'function') {
                if (C('url_params_bind')) {
                    var toString = controller[action].toString();
                    toString = toString.replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '');
                    var match = toString.match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].split(/,/).filter(function(item){
                        return item;
                    });
                    if (match.length) {
                        var data = [];
                        match.forEach(function(item){
                            var value = self.http.req.post[item] || self.http.req.query[item] || "";
                            data.push(value);
                        });
                        this.execAction(controller, action, oldAction, data);
                    }else{
                        this.execAction(controller, action, oldAction);
                    }
                }else{
                    this.execAction(controller, action, oldAction);
                }
                return true;
            }else{
                if (C('call_method') && typeof controller[C('call_method')] == 'function') {
                    return controller[C('call_method')](action);
                };
            }
            throw_error("action: " + action + " not found", this.http);
        },
        /**
         * 执行一个action, 支持before和after的统一操作
         * @param  {[type]} controller [description]
         * @param  {[type]} action     [description]
         * @param  {[type]} oldAction  [description]
         * @param  {[type]} data       [description]
         * @return {[type]}            [description]
         */
        execAction: function(controller, action, oldAction, data){
            var before = C('before_action_name');
            if (before && typeof controller[before] == 'function') {
                controller[before].call(controller, oldAction, action);
            };
            //绑定方法参数
            if (data) {
                controller[action].apply(controller, data);
            }else{
                controller[action]();
            }
            var after = C('after_action_name');
            if (after && typeof controller[after] == 'function') {
                controller[after].call(controller, oldAction, action);
            };
        },
        //加载自定义外部文件
        loadExtFile: function(){
            var files = C('load_ext_file');
            if (files) {
                if (is_string(files)) {
                    files = files.split(',');
                };
                files.forEach(function(file){
                    file = COMMONT_PATH + "/" + file + ".js";
                    if (is_file(file)) {
                        require(file);
                    };
                })
            };
        },
        //加载额外的配置
        loadExtConfig: function(){
            var files = C('load_ext_config');
            if (files) {
                if (is_string(files)) {
                    files = files.split(",");
                };
                files.forEach(function(file){
                    file = CONF_PATH + "/" + file + ".js";
                    if (is_file(file)) {
                        C(require(file));
                    };
                })
            };
        }
    }
});
//start server
module.exports.run = function(){
    var server = require("http").createServer(function (req, res) {
        var usage = G();
        think_require("Http")(req, res).run(function(http){
            http.setHeader("X-Powered-By", "thinkjs-" + THINK_VERSION);
            http.usage = {"initApp": usage, "initHttp": G()};
            //初始化Session
            if (C('session_auto_start')) {
                think_require('Session').start(http);
            };
            tag ('app_init', http);
            var instance = App(http);
            tag('app_begin', http);
            http.usage.appBegin = G();
            instance.exec();
            tag('app_end', http);
        });
    });
    var params = [C('port')];
    //禁止外网直接通过IP访问
    if (C('deny_remote_access_by_ip')) {
        params.push("127.0.0.1");
    };
    server.listen.apply(server, params);
};