var path = require("path");
//APP根目錄
if (!global.APP_PATH) {
    global.APP_PATH = path.dirname(__dirname) + "/App";
}else{
    global.APP_PATH = path.normalize(APP_PATH);
}
//RUNTIME目錄
if (!global.RUNTIME_PATH) {
    global.RUNTIME_PATH = global.APP_PATH + '/Runtime';
}else{
    global.RUNTIME_PATH = path.normalize(RUNTIME_PATH);
}
//DEBUG模式
if (global.APP_DEBUG === undefined) {
    global.APP_DEBUG = false;
};
//静态资源文件的跟目录
if (global.RESOURCE_PATH === undefined) {
	global.RESOURCE_PATH = "";
};
//THINKJS的根目錄
global.THINK_PATH = __dirname;
//从package.json文件里获取版本号
var version = JSON.parse(require("fs").readFileSync(THINK_PATH + "/../package.json", "utf8")).version;
global.THINK_VERSION = version;
require(THINK_PATH + "/Common/runtime.js");