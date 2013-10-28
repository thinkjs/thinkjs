/**
 * Action基类
 * @return {[type]} [description]
 */
var tool = think_require("Tool");
var action = module.exports = Class(function(){
    return {
        init: function(){
            tag('action_start');
        },
        isGet: function(){
            return __http.req.method == 'get';
        },
        isPost: function(){
            return __http.req.method == 'post';
        },
        isAjax: function(){
            return this._header("X-Requested-With").toLowerCase() == "xmlhttprequest";
        },
        get: function(name){
            return __http.req.query[name] || "";
        },
        post: function(name){
            return __http.req.post[name] || "";
        },
        param: function(name){
            return this.post(name) || this.get(name);
        },
        file: function(name){
            return __http.req.file[name] || "";
        },
        header: function(name){
            if (!name) {
                return __http.req.headers;
            };
            return __http.req.getHeader(name);
        },
        cookie: function(name){
            return __http.req.cookie[name] || "";
        },
        redirect: function(url){
            
        },
        echo: function(obj){
            if (is_array(obj) || is_object(obj)) {
                obj = JSON.stringify(obj);
            };
            __response.write(obj, C('encoding'));
        },
        end: function(obj){
            if (obj) {
                this.echo(obj);
            };
            global.__response.end();
        }
    }
});