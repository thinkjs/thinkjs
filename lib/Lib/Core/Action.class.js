/**
 * Action基类
 * @return {[type]} [description]
 */
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
            
        },
        _get: function(name){
            return __http.req.query[name] || "";
        },
        _post: function(name){
            return __http.req.post[name] || "";
        },
        _param: function(name){
            return this._post(name) || this._get(name);
        },
        _file: function(name){
            return __http.req.file[name] || "";
        },
        _cookie: function(){
            
        },
        redirect: function(){

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