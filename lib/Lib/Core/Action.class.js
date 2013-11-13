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
        /**
         * 获取客户端的ip
         * @return {[type]} [description]
         */
        ip: function(){
            return this.http.req.ip;
        },
        /**
         * 实例化View类
         * @return {[type]} [description]
         */
        initView: function(){
            if (!this.view) {
                this.view = think_require("View")(this.http);
            };
            return this.view;
        },
        /**
         * 是否是GET请求
         * @return {Boolean} [description]
         */
        isGet: function(){
            return this.http.req.method == 'get';
        },
        /**
         * 是否是POST请求
         * @return {Boolean} [description]
         */
        isPost: function(){
            return this.http.req.method == 'post';
        },
        /**
         * 是否是特定METHOD请求
         * @param  {[type]}  method [description]
         * @return {Boolean}        [description]
         */
        isMethod: function(method){
            return this.http.req.method == method;
        },
        /**
         * 是否是AJAX请求
         * @return {Boolean} [description]
         */
        isAjax: function(){
            return this.header("X-Requested-With").toLowerCase() == "xmlhttprequest";
        },
        /**
         * 获取QUERY参数
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name){
            return this.http.req.query[name] || "";
        },
        /**
         * 获取POST参数
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        post: function(name){
            return this.http.req.post[name] || "";
        },
        param: function(name){
            return this.post(name) || this.get(name);
        },
        file: function(name){
            return this.http.req.file[name] || "";
        },
        /**
         * header操作
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
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
        /**
         * cookie操作
         * @param  {[type]} name    [description]
         * @param  {[type]} value   [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
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
        /**
         * session
         * 如果是get操作，则返回一个promise
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
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
                code: code,
                http: this.http
            });
        },
        /**
         * 赋值变量到模版
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        assign: function(name, value){
            this.initView().assign(name, value);
            return this;
        },
        /**
         * 获取解析后的模版内容
         * @param  {[type]} templateFile [description]
         * @param  {[type]} content      [description]
         * @return {[type]}              [description]
         */
        fetch: function(templateFile, content){
            return this.initView().fetch(templateFile, content);
        },
        /**
         * 输出模版内容
         * @param  {[type]} templateFile [description]
         * @param  {[type]} charset      [description]
         * @param  {[type]} contentType  [description]
         * @param  {[type]} content      [description]
         * @return {[type]}              [description]
         */
        display: function(templateFile, charset, contentType, content){
            return this.initView().display(templateFile, charset, contentType, content);
        },
        error: function(msg){
            throw_error(msg, this.http);
        },
        /**
         * [action description]
         * @param  {[type]} action [description]
         * @return {[type]}        [description]
         */
        action: function(action){
            A(action, this.http);
        },
        /**
         * 输出内容
         * 自动JSON.stringify
         * 自定将数字等转化为字符串
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         */
        echo: function(obj){
            if (is_array(obj) || is_object(obj)) {
                obj = JSON.stringify(obj);
            };
            if (!is_string(obj) && !(obj instanceof Buffer)) {
                obj += "";
            };
            this.http._res.write(obj, C('encoding'));
        },
        end: function(obj){
            if (obj) {
                this.echo(obj);
            };
            this.http.res.end();
        },
        /**
         * 校验一个值是否合法
         * @param  {[type]} data      [description]
         * @param  {[type]} validType [description]
         * @return {[type]}           [description]
         */
        valid: function(data, validType){
            //单个值检测，只返回是否正常
            if (validType !== undefined) {
                data = {
                    value: data,
                    valid: validType
                };
                var result = think_require("Valid").check(data);
                return result.length == 0;
            };
            return think_require("Valid").check(data);
        }
    }
});