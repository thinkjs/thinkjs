//自动加载进行识别的路径
var autoloadPaths = {}
/**
 * [exports description]
 * @type {Object}
 */
var Think = module.exports = {
    //setInterval timer
    timer: 0,
    /**
     * [start description]
     * @return {[type]} [description]
     */
    start: function(){
        //debug模式下不捕获异常
        if (!APP_DEBUG) {
            this.register_exception();
        };
        //加载文件
        this.loadFiles();
        //合并自动加载的路径
        this.mergeAutoloadPath();
        //thinkRequire的autoload
        registerAutoload(this.autoload);
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
        //加载模式的配置文件
        if (APP_MODE) {
            var modeFile = CONF_PATH + "/" + APP_MODE + "_config.js";
            if (isFile(modeFile)) {
                C(require(modeFile));
            };
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
    //加载debug模式配置文件
    loadDebugFiles: function(){
        //加载debug模式下的配置
        C(require(THINK_PATH + "/Conf/debug.js"));
        if (APP_MODE) {
            var modeDebugFile = THINK_PATH + "/Conf/" + APP_MODE + "_debug.js";
            if (isFile(modeDebugFile)) {
                C(require(modeDebugFile));
            };
        };
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
        //清除require的缓存
        if (C('clear_require_cache')) {
            //这些文件不清除缓存
            var retainFiles = C('debug_retain_files');
            var self = this;
            this.timer = setInterval(function(){
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
        };
    },
    /**
     * 记录当前进程的id
     * 记录在Runtime/Data/app.pid文件里
     * @return {[type]} [description]
     */
    log_process_pid: function(){
        var isMaster = require('cluster').isMaster;
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
    /**
     * 合并autoload的path
     * @return {[type]} [description]
     */
    mergeAutoloadPath: function(){
        var cls = "__CLASS__";
        var sysfile = cls + ".class.js";
        var file = cls + C("class_file_suffix");
        var sysAutoloadPath = {
            "Behavior": [
                LIB_PATH + "/Behavior/" + file,
                THINK_LIB_PATH + "/Behavior/" + sysfile,
                THINK_EXTEND_PATH + "/Behavior/" + sysfile
            ],
            "Model": [
                LIB_PATH + "/Model/" + file,
                THINK_EXTEND_PATH + "/Model/" + sysfile
            ],
            "Controller": [
                LIB_PATH + "/Controller/" + file
            ],
            "Cache": [
                LIB_PATH + "/Driver/Cache/" + file,
                THINK_LIB_PATH + "/Driver/Cache/" + sysfile,
                THINK_EXTEND_PATH + "/Driver/Cache/" + sysfile
            ],
            "Db": [
                LIB_PATH + "/Driver/Db/" + file,
                THINK_LIB_PATH + "/Driver/Db/" + sysfile,
                THINK_EXTEND_PATH + "/Driver/Db/" + sysfile
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
            var override = false;
            if (isBoolean(paths[0])) {
                override = paths[0];
                paths.shift();
            };
            if (override) {
                sysAutoloadPath[type] = paths;  
            }else{
                paths.push.apply(paths, sysAutoloadPath[type]);
                sysAutoloadPath[type] = paths;
            }
        }
        autoloadPaths = sysAutoloadPath;
    },
    //thinkRequire的自动加载
    autoload: function(cls){
        for(var name in autoloadPaths){
            var length = name.length;
            if (cls.substr(0 - length) === name) {
                var list = autoloadPaths[name];
                var filepath = '';
                list.some(function(item){
                    item = item.replace(/__CLASS__/g, cls);
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
