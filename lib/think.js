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
//静态资源文件的根目录
if (global.RESOURCE_PATH === undefined) {
	global.RESOURCE_PATH = "";
};
//执行模式，默认为WEB起服务模式
if (global.APP_MODE === undefined) {
	global.APP_MODE = "";
};
//可以传一个querystring数据，如: xxx=yyy&aaa=bbb
if (process.argv[2]) {
	APP_MODE = 'cli';
	//模式下的数据
	global.APP_MODE_DATA = process.argv[2];
};
//THINKJS的根目录
global.THINK_PATH = __dirname;
//从package.json文件里获取版本号
var version = JSON.parse(require("fs").readFileSync(THINK_PATH + "/../package.json", "utf8")).version;
global.THINK_VERSION = version;
//加载运行时文件
require(THINK_PATH + "/Common/runtime.js");