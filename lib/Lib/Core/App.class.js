/**
 * 应用程序
 * @type {Object}
 */
var http = require("http");
var App = {
    init: function(){
        this.loadExtFile();
        this.loadExtConfig();
        think_require('Dispatcher').run();
        tag ('url_dispatch');
    },
    exec: function(){
        var module = '';
        var group = '';
        if (!(/^[A-Za-z](\w)*$/.test(__http.req.module))) {
            module = '';
        }else{
            group = __http.req.group && C('app_group_mode') == 0 ? __http.req.group + "/" : "";
            module = A(group + __http.req.module);
        }
        if (!module) {
            module = A(group + "Empty");
            if (!module) {
                throw_error(__http.req.module + " module not found");
            };
        };
        var action = __http.req.action;
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
                throw_error("action black");
            };
        };
        if (!/^[A-Za-z](\w)*$/.test(action)) {
            throw_error('action name error');
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
                        var value = __http.req.post[item] || __http.req.query[item] || "";
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
        throw_error("action: "+action+" not found");
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
    },
    run: function(){
        var self = this;
        http.createServer(function (request, response) {
            global.__request = request;
            global.__response = response;
            think_require("Http").run(function(){
                tag ('app_init');
                self.init();
                tag('app_begin');
                G('initTime');
                self.exec();
                tag('app_end');
                if (C('log_record')) {
                    think_require('Log').save();
                };
            });
        }).listen(C('port'));
    }
}
module.exports = App;