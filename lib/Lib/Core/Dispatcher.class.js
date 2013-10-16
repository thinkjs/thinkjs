/**
 * 路由调配
 * @type {Object}
 */
var url = require("url");
var Dispatcher = {
    run: function(){
        var path = this.getPathInfo();
        //console.log(__request)
    },
    getPathInfo: function(){
        var path = '';
        if (C('get_pathinfo_fn') && global[C('get_pathinfo_fn')]) {
            path = global[C('get_pathinfo_fn')]();
        }else{
            path = __request.url;
        }
        var info = url.parse(path);
        return info.pathname;
    }
}
module.exports = Dispatcher;