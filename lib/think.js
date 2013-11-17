var path = require("path");
if (!global.APP_PATH) {
    global.APP_PATH = path.dirname(__dirname) + "/App";
}else{
    global.APP_PATH = path.normalize(APP_PATH);
}
if (!global.RUNTIME_PATH) {
    global.RUNTIME_PATH = global.APP_PATH + '/Runtime';
}else{
    global.RUNTIME_PATH = path.normalize(RUNTIME_PATH);
}
if (global.APP_DEBUG === undefined) {
    global.APP_DEBUG = false;
};
global.THINK_PATH = __dirname;
//从package.json文件里获取版本号
var version = JSON.parse(require("fs").readFileSync(THINK_PATH + "/../package.json", "utf8")).version;
global.THINK_VERSION = version;
require(THINK_PATH + "/Common/runtime.js");