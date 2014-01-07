/**
 * 运行时
 */

var fs = require("fs");

//系统路径设置
global.THINK_LIB_PATH = THINK_PATH + "/Lib";
//应用路径设置
var config = {
    COMMON_PATH: APP_PATH + "/Common",
    LIB_PATH: APP_PATH + "/Lib",
    CONF_PATH: APP_PATH + "/Conf",
    LANG_PATH: APP_PATH + "/Lang",
    TPL_PATH: APP_PATH + "/Tpl",
    HTML_PATH: RUNTIME_PATH + "/Html",
    LOG_PATH: RUNTIME_PATH + "/Log",
    TEMP_PATH: RUNTIME_PATH + "/Temp",
    DATA_PATH: RUNTIME_PATH + "/Data",
    CACHE_PATH: RUNTIME_PATH + "/Cache"
}
for(var name in config){
    if (global[name] === undefined) {
        global[name] = config[name];
    };
}
/**
 * 加载runtime时相关的文件
 * @return {[type]} [description]
 */
function load_runtime_files(){
    require(THINK_PATH + "/Common/extend.js");
    require(THINK_PATH + "/Common/common.js");
    require(THINK_PATH + "/Common/function.js");
    //别名导入
    var alias = require(THINK_PATH + "/Conf/alias.js");
    aliasImport(alias);

    if (!fs.existsSync(LIB_PATH)) {
        build_app_dir();
    }else if(!fs.existsSync(CACHE_PATH)){
        check_runtime();
    }
}
/**
 * 检查Runtime目录是否可写
 * @return {[type]} [description]
 */
function check_runtime(){
    if (!fs.existsSync(RUNTIME_PATH)) {
        fs.mkdirSync(RUNTIME_PATH, "0777");
    }else{
        if (!isWritable(RUNTIME_PATH)) {
            console.log(RUNTIME_PATH + " 目录不可写");
            process.exit(0);
        };
    }
}
/**
 * 生成项目对应的目录和文件
 * @return {[type]} [description]
 */
function build_app_dir(){
    if (!isDir(APP_PATH)) {
        mkdir(APP_PATH);
    };
    if (isWritable(APP_PATH)) {
        var dirs = [
            LIB_PATH, RUNTIME_PATH, CONF_PATH, 
            COMMON_PATH, CACHE_PATH,
            LOG_PATH, TEMP_PATH, DATA_PATH, 
            LIB_PATH + '/Model',
            LIB_PATH + '/Controller/Home',
            LIB_PATH + '/Behavior',
            LIB_PATH + '/Driver',
            TPL_PATH + "/Home"
        ];
        dirs.forEach(function(dir){
            if (!isDir(dir)) {
                mkdir(dir, "0755");
            };
        });
        var config_file = CONF_PATH + "/config.js";
        if (!isFile(config_file)) {
            var data = 'module.exports = {\n\t//"配置项": "配置值"\n};'
            fs.writeFileSync(config_file, data);
        };
        build_first_action();
    }else{
        console.log(APP_PATH + " is not writable.");
        process.exit(0);
    }
}
function build_first_action(){
    var file = LIB_PATH + "/Controller/Home/IndexController.class.js";
    if (!isFile(file)) {
        var content = getFileContent(THINK_PATH + "/Tpl/IndexController.class.js");
        fs.writeFileSync(file, content);
    };
}
load_runtime_files();
//启动
thinkRequire('Think').start();