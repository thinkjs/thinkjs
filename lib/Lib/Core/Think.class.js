/**
 * [exports description]
 * @type {Object}
 */
module.exports = {
    start: function(){
        this.register_exception();
        //think_require的autoload
        register_autoload(this.autoload);
        this.buildApp();
        think_require('App').run();
    },
    /**
     * 注册异常处理
     * @return {[type]} [description]
     */
    register_exception: function(){
        process.on('uncaughtException', function(err) {
            if (err && err.http) {
                var http = err.http;
                 switch(err.type){
                    case "deny":
                        http.res.statusCode = err.code || 403;
                        http.res.write(err.msg, C('encoding'));
                        break;
                    default:
                        http.res.statusCode = err.code || 500;
                        http.res.write(err.msg, C('encoding'));
                }
                err.http.end();
                return;
            };
            console.log(err.stack);
        });
    },
    buildApp: function(){
        //加载系统默认配置
        C(require(THINK_PATH + '/Conf/convention.js'));
        //加载用户配置
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
        //加载行为配置
        if (C('app_tags_on')) {
            //加载系统行为配置
            C('sys_tags', require(THINK_PATH + "/Conf/tags.js"));
            //加载用户的行为配置
            var tagFile = COMMON_PATH + "/tags.js";
            if (is_file(tagFile)) {
                C('tags', require(tagFile));
            };
        };
        //common文件
        if (is_file(COMMON_PATH + "/common.js")) {
            require(COMMON_PATH + "/common.js");
        };
        //别名文件
        if (is_file(COMMON_PATH + "/alias.js")) {
            alias_import(require(COMMON_PATH + "/alias.js"));
        };
        //debug模式
        if (APP_DEBUG) {
            //加载debug模式下的配置
            if (is_file(THINK_PATH + "/Conf/debug.js")) {
                C(require(THINK_PATH + "/Conf/debug.js"));
            };
            //debug下自定义状态的配置
            var status = C('app_status');
            if (status && is_file(CONF_PATH + "/" + status + '.js')) {
                C(require(CONF_PATH + "/" + status + ".js"));
            };
            //debug模式下实时加载，文件修改后刷新立即生效
            setInterval(function(){
                for(var file in require.cache){
                    delete require.cache[file];
                }
            }, 100);
        };
    },
    //模拟PHP的自动加载
    autoload: function(cls){
        var sysfile = cls + ".class.js";
        var file = cls + C("class_file_suffix");
        var config = {
            Behavior: [
                THINK_LIB_PATH + "/Behavior/" + sysfile,
                LIB_PATH + "/Behavior/" + file
            ],
            Model: [
                LIB_PATH + "/Model/" + file
            ],
            Controller: [
                LIB_PATH + "/Controller/" + file
            ],
            Cache: [
                LIB_PATH + "/Driver/Cache/" + file,
                THINK_LIB_PATH + "/Driver/Cache/" + sysfile
            ],
            Db: [
                LIB_PATH + "/Driver/Db/" + file,
                THINK_LIB_PATH + "/Driver/Db/" + sysfile
            ],
            Template: [
                LIB_PATH + "/Driver/Template/" + file,
                THINK_LIB_PATH + "/Driver/Template/" + sysfile
            ],
            Socket: [
                LIB_PATH + "/Driver/Socket/" + file,
                THINK_LIB_PATH + "/Driver/Socket/" + sysfile
            ],
            Session: [
                LIB_PATH + "/Driver/Session/" + file,
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
