/**
 * [exports description]
 * @type {Object}
 */
module.exports = {
    start: function(){
        this.register_exception();
        register_autoload(this.autoload);
        this.buildApp();
        think_require('App').run();
    },
    register_exception: function(){
        process.on('uncaughtException', function(err) {
            if (typeof err && err.http) {
                var http = err.http;
                 switch(err.type){
                    case "deny":
                        http._res.statusCode = err.code || 403;
                        http._res.write(err.msg, C('encoding'));
                        break;
                    case "redirect":
                        http._res.statusCode = err.code || 302;
                        http._res.setHeader("Location", err.msg);
                        break;
                    default:
                        http._res.statusCode = err.code || 500;
                        http._res.write(err.msg, C('encoding'));
                }
                err.http._res.end();
                return;
            };
            console.log(err.stack);
        });
    },
    buildApp: function(){
        C(require(THINK_PATH + '/Conf/convention.js'));
        var file = CONF_PATH + '/config.js';
        if (is_file(file)) {
            C(require(file));
        };
        //自定义路由
        if (C('url_route_on')) {
            if (is_file(CONF_PATH + "/route.js")) {
                C("url_route_rules", require(CONF_PATH + "/route.js"));
            };
        };
        if (C('app_tags_on')) {
            C('sys_tags', require(THINK_PATH + "/Conf/tags.js"));
        };
        //common文件
        if (is_file(COMMON_PATH + "/common.js")) {
            require(COMMON_PATH + "/common.js");
        };
        //别名文件
        if (is_file(COMMON_PATH + "/alias.js")) {
            alias_import(require(COMMON_PATH + "/alias.js"));
        };
        if (APP_DEBUG) {
            C(require(THINK_PATH + "/Conf/debug.js"));
            var status = C('app_status');
            if (status && is_file(CONF_PATH + "/" + status + '.js')) {
                C(require(CONF_PATH + "/" + status + ".js"));
            };
        };
    },
    //模拟PHP的自动加载
    autoload: function(cls){
        var sysfile = cls + ".class.js";
        var file = cls + C("class_file_suffix");
        var config = {
            Behavior: [
                THINK_LIB_PATH + "/Behavior/" + sysfile,
                EXTEND_PATH + "/Behavior/" + sysfile,
                LIB_PATH + "/Behavior/" + file
            ],
            Model: [
                LIB_PATH + "/Model/" + file,
                EXTEND_PATH + "/Model/" + sysfile
            ],
            Action: [
                LIB_PATH + "/Action/" + file,
                EXTEND_PATH + "/Action/" + sysfile
            ],
            Cache: [
                EXTEND_PATH + "/Driver/Cache/" + sysfile,
                THINK_LIB_PATH + "/Driver/Cache/" + sysfile
            ],
            Db: [
                EXTEND_PATH + "/Driver/Cache/" + sysfile,
                THINK_LIB_PATH + "/Driver/Cache/" + sysfile
            ],
            Template: [
                EXTEND_PATH + "/Driver/Template/" + sysfile,
                THINK_LIB_PATH + "/Driver/Template/" + sysfile
            ],
            Socket: [
                EXTEND_PATH + "/Driver/Socket/" + sysfile,
                THINK_LIB_PATH + "/Driver/Socket/" + sysfile
            ],
            Session: [
                EXTEND_PATH + "/Driver/Session/" + sysfile,
                THINK_LIB_PATH + "/Driver/Session/" + sysfile
            ]
        };
        for(var name in config){
            var length = name.length;
            if (cls.substr(0 - length) === name) {
                var list = config[name];
                var filepath = '';
                list.some(function(item){
                    if (is_file(item)) {
                        filepath = item;
                        return true;
                    };
                });
                if (filepath) {
                    return filepath;
                }; 
            };
        }
    }
}
