var path = require("path");
var fs = require("fs");

//APP根目錄
global.APP_PATH = global.APP_PATH ? path.normalize(global.APP_PATH) : path.dirname(__dirname) + "/App";
//RUNTIME目录
global.RUNTIME_PATH = global.RUNTIME_PATH ? path.normalize(global.RUNTIME_PATH) : global.APP_PATH + "/Runtime";
//DEBUG模式
global.APP_DEBUG = global.APP_DEBUG || false;
//静态资源文件的根目录
global.RESOURCE_PATH = global.RESOURCE_PATH || "";
//执行模式，默认为WEB起服务模式
global.APP_MODE = global.APP_MODE || "";
//可以传一个querystring数据，如: xxx=yyy&aaa=bbb
if (process.argv[2]) {
	global.APP_MODE = "cli";
	//模式下的数据
	global.APP_MODE_DATA = process.argv[2];
}
//THINKJS的根目录
global.THINK_PATH = __dirname;
//从package.json文件里获取版本号
global.THINK_VERSION = JSON.parse(fs.readFileSync(global.THINK_PATH + "/../package.json", "utf8")).version;
//启动
require(global.THINK_PATH + "/Lib/Core/Think.js").start();