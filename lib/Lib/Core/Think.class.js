/**
 * [exports description]
 * @type {Object}
 */
module.exports = {
    /**
     * [start description]
     * @return {[type]} [description]
     */
    start: function(){
        //debug模式下不捕获异常
        if (!APP_DEBUG) {
            this.register_exception();
        };
        //thinkRequire的autoload
        registerAutoload(this.autoload);
        //加载文件
        this.loadFiles();
        //debug模式
        if (APP_DEBUG) {
            this.debug();
        };
        //记录进程的id
        this.log_process_pid();

        thinkRequire('App').run();
    },
    /**
     * 注册异常处理
     * @return {[type]} [description]
     */
    register_exception: function(){
        process.on('uncaughtException', function(err) {
            console.log(err);
        });
    },
    /**
     * 加载项目下对应的文件
     * @return {[type]} [description]
     */
    loadFiles: function(){
        //加载系统默认配置
        C(require(THINK_PATH + '/Conf/config.js'));
        //加载用户配置
        var file = CONF_PATH + '/config.js';
        if (isFile(file)) {
            C(require(file));
        };
        //自定义路由
        if (C('url_route_on') && isFile(CONF_PATH + "/route.js")) {
            C("url_route_rules", require(CONF_PATH + "/route.js"));
        };
        //加载行为配置
        if (C('app_tag_on')) {
            //加载系统行为配置
            C('sys_tag', require(THINK_PATH + "/Conf/tag.js"));
            //加载用户的行为配置
            var tagFile = CONF_PATH + "/tag.js";
            if (isFile(tagFile)) {
                C('tag', require(tagFile));
            };
        };
        //common文件
        if (isFile(COMMON_PATH + "/common.js")) {
            require(COMMON_PATH + "/common.js");
        };
        //别名文件
        if (isFile(COMMON_PATH + "/alias.js")) {
            aliasImport(require(COMMON_PATH + "/alias.js"));
        };
        this.loadExtConfig();
        this.loadExtFiles();
    },
    //加载自定义外部文件
    loadExtFiles: function(){
        var files = C('load_ext_file');
        if (files) {
            if (isString(files)) {
                files = files.split(',');
            };
            files.forEach(function(file){
                file = COMMON_PATH + "/" + file + ".js";
                if (isFile(file)) {
                    require(file);
                };
            })
        };
    },
    //加载额外的配置
    loadExtConfig: function(){
        var files = C('load_ext_config');
        if (files) {
            if (isString(files)) {
                files = files.split(",");
            };
            files.forEach(function(file){
                file = CONF_PATH + "/" + file + ".js";
                if (isFile(file)) {
                    C(require(file));
                };
            })
        };
    },
    loadDebugFiles: function(){
        //加载debug模式下的配置
        C(require(THINK_PATH + "/Conf/debug.js"));
        //debug下自定义状态的配置
        var status = C('app_status');
        if (status) {
            if (isFile(CONF_PATH + "/" + status + '.js')) {
                C(require(CONF_PATH + "/" + status + ".js"));
            };
        }else{
            if (isFile(CONF_PATH + '/debug.js')) {
                C(require(CONF_PATH + '/debug.js'));
            };
        }
    },
    /**
     * debug模式下一些特殊处理
     * @return {[type]} [description]
     */
    debug: function(){
        this.loadDebugFiles();
        //这些文件不清除缓存
        var retainFiles = C('debug_retain_files');
        var self = this;
        setInterval(function(){
            //清除已经绑定的自定义事件
            E(null);
            for(var file in require.cache){
                var flag = retainFiles.some(function(item){
                    if (file.indexOf(item) > -1) {
                        return true;
                    };
                });
                if (!flag) {
                    delete require.cache[file];
                };
            }
            self.loadFiles();
            self.loadDebugFiles();
        }, 100);
    },
    /**
     * 记录当前进程的id
     * 记录在Runtime/Data/app.pid文件里
     * @return {[type]} [description]
     */
    log_process_pid: function(){
        var isMaster = require('cluster').isMaster
        if (C('log_process_pid') && isMaster) {
            var pidFile = DATA_PATH + "/app.pid";
            var fs = require("fs");
            fs.writeFileSync(pidFile, process.pid);
            //进程退出时删除该文件
            process.on('SIGTERM', function () {
                if (fs.existsSync(pidFile)) {
                    fs.unlinkSync(pidFile);
                }
                process.exit(0);
            });
        };
    },
    //thinkRequire的自动加载
    autoload: function(cls){
        var sysfile = cls + ".class.js";
        var file = cls + C("class_file_suffix");
        var sysCls = {
            "Behavior": [
                THINK_LIB_PATH + "/Behavior/" + sysfile,
                LIB_PATH + "/Behavior/" + file
            ],
            "Model": [
                LIB_PATH + "/Model/" + file
            ],
            "Controller": [
                LIB_PATH + "/Controller/" + file
            ],
            "Cache": [
                LIB_PATH + "/Driver/Cache/" + file,
                THINK_LIB_PATH + "/Driver/Cache/" + sysfile
            ],
            "Db": [
                LIB_PATH + "/Driver/Db/" + file,
                THINK_LIB_PATH + "/Driver/Db/" + sysfile
            ],
            "Template": [
                LIB_PATH + "/Driver/Template/" + file,
                THINK_LIB_PATH + "/Driver/Template/" + sysfile
            ],
            "Socket": [
                LIB_PATH + "/Driver/Socket/" + file,
                THINK_LIB_PATH + "/Driver/Socket/" + sysfile
            ],
            "Session": [
                LIB_PATH + "/Driver/Session/" + file,
                THINK_LIB_PATH + "/Driver/Session/" + sysfile
            ]
        };
        var autoloadPath = C('autoload_path');
        for(var type in autoloadPath){
            var paths = autoloadPath[type];
            if (!isArray(paths)) {
                paths = [paths];
            };
            paths = paths.map(function(path){
                return path.replace(/__CLASS__/g, cls);
            });
            sysCls[type] = paths;
        }
        for(var name in sysCls){
            var length = name.length;
            if (cls.substr(0 - length) === name) {
                var list = sysCls[name];
                var filepath = '';
                list.some(function(item){
                    if (isFile(item)) {
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
