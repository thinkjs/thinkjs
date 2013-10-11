global._beginTime = new Date * 1;
var path = require("path");
if (!global.APP_PATH) {
    throw new Error('define APP_PATH');
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
require(THINK_PATH + "/Common/runtime");