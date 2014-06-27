var path = require('path');
var fs = require('fs');

//APP根目錄
global.APP_PATH = global.APP_PATH ? path.normalize(global.APP_PATH) : path.dirname(__dirname) + '/App';
//RUNTIME目录
global.RUNTIME_PATH = global.RUNTIME_PATH ? path.normalize(global.RUNTIME_PATH) : global.APP_PATH + '/Runtime';
//DEBUG模式
global.APP_DEBUG = global.APP_DEBUG || false;
//静态资源文件的根目录
global.RESOURCE_PATH = global.RESOURCE_PATH || '';
//THINKJS的根目录
global.THINK_PATH = __dirname;
//默认为http模式
global.APP_MODE = 'http';
//命令行模式
if (process.argv[2]) {
	APP_MODE = 'cli';
}
//从package.json文件里获取版本号
global.THINK_VERSION = JSON.parse(fs.readFileSync(global.THINK_PATH + '/../package.json', 'utf8')).version;
//启动
require(global.THINK_PATH + '/Lib/Core/Think.js').start();