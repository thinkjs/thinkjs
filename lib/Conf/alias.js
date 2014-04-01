/**
 * 模块别名，模块名到具体的路径，模块名不能有重复
 * 使用thinkRequire加载模块时有效
 * @type {Object}
 */
module.exports = {
    Controller: THINK_LIB_PATH + "/Core/Controller.js",
    App: THINK_LIB_PATH + "/Core/App.js",
    Behavior: THINK_LIB_PATH + "/Util/Behavior.js",
    Cache: THINK_LIB_PATH + "/Util/Cache.js",
    Db: THINK_LIB_PATH + "/Core/Db.js",
    Dispatcher: THINK_LIB_PATH + "/Core/Dispatcher.js",
    Filter: THINK_LIB_PATH + "/Util/Filter.js",
    Http: THINK_LIB_PATH + "/Core/Http.js",
    Log: THINK_LIB_PATH + "/Util/Log.js",
    Model: THINK_LIB_PATH + "/Core/Model.js",
    Session: THINK_LIB_PATH + "/Util/Session.js",
    Think: THINK_LIB_PATH + "/Core/Think.js",
    Valid: THINK_LIB_PATH + "/Util/Valid.js",
    View: THINK_LIB_PATH + "/Core/View.js",
    WebSocket: THINK_LIB_PATH + "/Util/WebSocket.js",
};