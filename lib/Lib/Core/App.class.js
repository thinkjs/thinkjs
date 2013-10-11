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
        tag ( 'url_dispatch' );
    },
    exec: function(){
        tag("route_check")
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
            tag ( 'app_init' );
            self.init();
            tag('app_begin');
            G('initTime');
            self.exec();
            tag('app_end');
            if (C('log_record')) {
                think_require('Log').save();
            };
            response.end();
        }).listen(C('port') || 8360);
    }
}
module.exports = App;