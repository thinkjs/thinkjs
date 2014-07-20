var path = require('path');
var fs = require('fs');

if (!global.APP_PATH) {
  throw new Error('APP_PATH must be defined');
}
if (!global.RUNTIME_PATH) {
  global.RUNTIME_PATH = APP_PATH + '/Runtime';
}
//DEBUG模式
if (global.APP_DEBUG === undefined) {
  global.APP_DEBUG = false;
}
//线上环境自动关闭debug模式
if (process.argv[2] === 'online' && APP_DEBUG === true) {
  process.argv[2] = '';
  APP_DEBUG = false;
}
//静态资源文件的根目录
global.RESOURCE_PATH = global.RESOURCE_PATH || '';
//THINKJS的根目录
global.THINK_PATH = __dirname;
//默认为http模式
global.APP_MODE = global.APP_MODE || '';
//命令行模式
if (process.argv[2]) {
  APP_MODE = 'cli';
}
//从package.json文件里获取版本号
var pkgPath = path.dirname(THINK_PATH) + '/package.json';
var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
global.THINK_VERSION = pkg.version;
//启动
require(THINK_PATH + '/Lib/Core/Think.js').start();