/**
 * Action基类
 * @return {[type]} [description]
 */
module.exports = Class(function(){
    return {
        init: function(http){
            this.http = http;
            this.view = null;
            tag('action_start');
        },
        ip: function(){
            return this.http.req.ip;
        },
        initView: function(){
            if (!this.view) {
                this.view = think_require("View")(this.http);
            };
            return this.view;
        },
        isGet: function(){
            return this.http.req.method == 'get';
        },
        isPost: function(){
            return this.http.req.method == 'post';
        },
        isMethod: function(method){
            return this.http.req.method == method;
        },
        isAjax: function(){
            return this.header("X-Requested-With").toLowerCase() == "xmlhttprequest";
        },
        get: function(name){
            return this.http.req.query[name] || "";
        },
        post: function(name){
            return this.http.req.post[name] || "";
        },
        param: function(name){
            return this.post(name) || this.get(name);
        },
        file: function(name){
            return this.http.req.file[name] || "";
        },
        header: function(name, value){
            if (value !== undefined) {
                this.http.res.setHeader(name, value);
                return this;
            };
            if (name === undefined) {
                return this.http.req.headers;
            };
            return this.http.req.getHeader(name);
        },
        cookie: function(name, value, options){
            if (value !== undefined) {
                this.http.res.setCookie(name, value, options);
                return this;
            };
            if (name === undefined) {
                return this.http.req.cookie;
            };
            return this.http.req.cookie[name];
        },
        session: function(name, value){
            think_require('Session').start(this.http);
            var instance = this.http.req.session;
            if (name === undefined) {
                return instance.rm();
            };
            if (value !== undefined) {
                instance.set(name, value);
                return this;
            };
            return instance.get(name);
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
        error: function(msg){
            throw_error(msg, this.http);
        },
        action: function(action){
            A(action, this.http);
        },
        echo: function(obj){
            if (is_array(obj) || is_object(obj)) {
                obj = JSON.stringify(obj);
            };
            this.http._res.write(obj, C('encoding'));
        },
        end: function(obj){
            if (obj) {
                this.echo(obj);
            };
            this.http.res.end();
        }
    }
});