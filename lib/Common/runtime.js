/**
 * 运行时
 */
"use strict";
var fs = require("fs");

//系统路径设置
global.THINK_LIB_PATH = THINK_PATH + "/Lib";
//应用路径设置
var config = {
    COMMON_PATH: APP_PATH + "/Common",
    LIB_PATH: APP_PATH + "/Lib",
    CONF_PATH: APP_PATH + "/Conf",
    LANG_PATH: APP_PATH + "/Lang",
    TMPL_PATH: APP_PATH + "/Tpl",
    HTML_PATH: APP_PATH + "/Html",
    LOG_PATH: RUNTIME_PATH + "/Logs",
    TEMP_PATH: RUNTIME_PATH + "/Temp",
    DATA_PATH: RUNTIME_PATH + "/Data",
    CACHE_PATH: RUNTIME_PATH + "/Cache"
}
for(var name in config){
    if (global[name] === undefined) {
        global[name] = config[name];
    };
}
function load_runtime_files(){
    require(THINK_PATH + "/Common/common.js");
    require(THINK_PATH + "/Common/functions.js");
    //别名导入
    var alias = require(THINK_PATH + "/Conf/alias.js");
    alias_import(alias);

    if (!fs.existsSync(LIB_PATH)) {
        build_app_dir();
    }else if(!fs.existsSync(CACHE_PATH)){
        check_runtime();
    }
}
function check_runtime(){
    if (!fs.existsSync(RUNTIME_PATH)) {
        fs.mkdirSync(RUNTIME_PATH, "0777");
    }else{
        if (!is_writable(RUNTIME_PATH)) {
            console.log(RUNTIME_PATH + " 目录不可写");
            process.exit(0);
        };
    }
}
function build_app_dir(){
    if (!is_dir(APP_PATH)) {
        mkdir(APP_PATH);
    };
    if (is_writable(APP_PATH)) {
        var dirs = [
            LIB_PATH, RUNTIME_PATH, CONF_PATH, COMMON_PATH, CACHE_PATH,
            TMPL_PATH, LOG_PATH, TEMP_PATH, DATA_PATH, 
            LIB_PATH + '/Model',
            LIB_PATH + '/Action/Home',
            LIB_PATH + '/Behavior',
            LIB_PATH + '/Driver'
        ];
        dirs.forEach(function(dir){
            if (!is_dir(dir)) {
                mkdir(dir, "0755");
            };
        });
        var config_file = CONF_PATH + "/config.js";
        if (!is_file(config_file)) {
            var data = 'module.exports = {\n\t//"配置项": "配置值"\n};'
            fs.writeFileSync(config_file, data);
        };
        build_first_action();
    }else{
        process.exit(0);
    }
}
function build_first_action(){
    var file = LIB_PATH + "/Action/Home/IndexAction.class.js";
    if (!is_file(file)) {
        var content = file_get_contents(THINK_PATH + "/Tpl/IndexAction.class.js");
        fs.writeFileSync(file, content);
    };
}
load_runtime_files();
think_require('Think').start();