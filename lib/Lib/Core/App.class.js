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
                }catch(e){
                    console.log(e);
                }
            }
            if (!controller) {
                var event = C('empty_controller_event');
                if (event && E(event, true).length > 0) {
                    E(event, this.http.controller, group, this.http);
                    return true;
                };
            };
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
                //方法参数自动绑定，直接从形参里拿到对应的值
                if (C('url_params_bind')) {
                    var toString = controller[action].toString();
                    toString = toString.replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '');
                    var match = toString.match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].split(/,/).filter(function(item){
                        return item;
                    });
                    if (match.length) {
                        var data = [];
                        match.forEach(function(item){
                            var value = self.http.post[item] || self.http.get[item] || "";
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
                //当指定的方法不存在时，调用魔术方法
                //默认为__call方法
                if (C('call_method') && typeof controller[C('call_method')] == 'function') {
                    return controller[C('call_method')](action);
                };
            }
            throw_error("action: " + action + " not found", this.http);
        },
        /**
         * 执行一个action, 支持before和after的统一操作
         * 不对每个action都增加一个before和after，而是使用统一的策略
         * 默认before和after调用名__before和__after
         * @param  {[type]} controller [description]
         * @param  {[type]} action     [description]
         * @param  {[type]} oldAction  [description]
         * @param  {[type]} data       [description]
         * @return {[type]}            [description]
         */
        execAction: function(controller, action, oldAction, data){
            //before action
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
            //after action
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
            //http.usage = {"initApp": usage, "initHttp": G()};
            //初始化Session
            if (C('session_auto_start')) {
                think_require('Session').start(http);
            };
            tag ('app_init', http);
            var instance = App(http);
            //如果是静态资源类请求，则结束后续的执行
            if (http.isResourceRequest) {
                return true;
            };
            tag('app_begin', http);
            //http.usage.appBegin = G();
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