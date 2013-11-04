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
            think_require('Dispatcher')(http).run();
            tag ('url_dispatch', http);
        },
        exec: function(){
            var module = '';
            var group = '';
            var self = this;
            if (!(/^[A-Za-z](\w)*$/.test(this.http.req.module))) {
                module = '';
            }else{
                group = this.http.req.group && C('app_group_mode') == 0 ? this.http.req.group + "/" : "";
                module = A(group + this.http.req.module, this.http);
            }
            if (!module) {
                module = A(group + "Empty", this.http);
                if (!module) {
                    throw_error(this.http.req.module + " module not found", this.http);
                };
            };
            var action = this.http.req.action;
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
            if (!/^[A-Za-z](\w)*$/.test(action)) {
                throw_error('action name error', this.http);
            };
            if (typeof module[action] == 'function') {
                if (C('url_params_bind')) {
                    var toString = module[action].toString();
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
                        module[action].apply(module, data);
                    }else{
                        module[action]();
                    }
                }else{
                    module[action]();
                }
                return true;
            }else{
                if (C('call_method') && typeof module[C('call_method')] == 'function') {
                    return module[C('call_method')](action);
                };
            }
            throw_error("action: "+action+" not found", this.http);
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
    require("http").createServer(function (req, res) {
        think_require("Http")(req, res).run(function(http){
            //初始化Session
            if (C('session_auto_start')) {
                think_require('Session').start();
            };
            tag ('app_init', http);
            var instance = App(http);
            tag('app_begin', http);
            G('initTime');
            instance.exec();
            tag('app_end', http);
        });
    }).listen(C('port'));
};