/**
 * Action基类
 * @return {[type]} [description]
 */
module.exports = Class(function(){
    return {
        ip: __http.req.ip,
        init: function(){
            this.view = null;
            tag('action_start');
        },
        initView: function(){
            if (!this.view) {
                this.view = think_require("View")();
            };
            return this.view;
        },
        isGet: function(){
            return __http.req.method == 'get';
        },
        isPost: function(){
            return __http.req.method == 'post';
        },
        isMethod: function(method){
            return __http.req.method == method;
        },
        isAjax: function(){
            return this.header("X-Requested-With").toLowerCase() == "xmlhttprequest";
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
        header: function(name, value){
            if (value !== undefined) {
                __http.res.setHeader(name, value);
                return this;
            };
            if (name === undefined) {
                return __http.req.headers;
            };
            return __http.req.getHeader(name);
        },
        cookie: function(name, value, options){
            if (value !== undefined) {
                __http.res.setCookie(name, value, options);
                return this;
            };
            if (name === undefined) {
                return __http.req.cookie;
            };
            return __http.req.cookie[name];
        },
        session: function(){
            
        },
        redirect: function(url, code){
            throw_error({
                type: "redirect",
                msg: url,
                code: code
            });
        },
        assign: function(name, value){
            this.initView().assign(name, value);
            return this;
        },
        fetch: function(templateFile, content){
            return this.initView().fetch(templateFile, content);
        },
        display: function(templateFile, charset, contentType, content){
            return this.initView().display(templateFile, charset, contentType, content);
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
            __response.end();
        }
    }
});