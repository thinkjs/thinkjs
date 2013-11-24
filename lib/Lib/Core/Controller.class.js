/**
 * Controller 基类
 * @return {[type]} [description]
 */
var fs = require("fs");
module.exports = Class(function(){
    return {
        /**
         * 初始化执行方法
         * @param  {[type]} http [description]
         * @return {[type]}      [description]
         */
        init: function(http){
            this.http = http;
            this.view = null;
            //将http数据打到模版里
            this.assign("http", this.http);
            //将配置信息打到模版里
            this.assign("config", C());
            tag('action_start', this.http);
        },
        /**
         * 获取客户端的ip
         * @return {[type]} [description]
         */
        ip: function(){
            return this.http.ip();
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
            return this.http.method == 'get';
        },
        /**
         * 是否是POST请求
         * @return {Boolean} [description]
         */
        isPost: function(){
            return this.http.method == 'post';
        },
        /**
         * 是否是特定METHOD请求
         * @param  {[type]}  method [description]
         * @return {Boolean}        [description]
         */
        isMethod: function(method){
            return this.http.method == method;
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
            if (name === undefined) {
                return this.http.query;
            };
            return this.http.query[name] || "";
        },
        /**
         * 获取POST参数
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        post: function(name){
            if (name === undefined) {
                return this.http.post;
            };
            return this.http.post[name] || "";
        },
        /**
         * 获取参数
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        param: function(name){
            return this.post(name) || this.get(name);
        },
        /**
         * 获取上传的文件
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        file: function(name){
            return this.http.file[name] || {};
        },
        /**
         * header操作
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        header: function(name, value){
            if (is_object(name)) {
                for(var key in name){
                    this.header(key, name[key]);
                }
                return this;
            };
            if (value !== undefined) {
                //对是否发送了Content-Type头信息进行标记
                if (name.toLowerCase() == 'content-type') {
                    this.http.sendContentType = true;
                };
                this.http.setHeader(name, value);
                return this;
            };
            if (name === undefined) {
                return this.http.headers;
            };
            return this.http.getHeader(name);
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
                this.http.setCookie(name, value, options);
                return this;
            };
            if (name === undefined) {
                return this.http.cookie;
            };
            return this.http.cookie[name];
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
            var instance = this.http.session;
            if (name === undefined) {
                return instance.rm();
            };
            if (value !== undefined) {
                instance.set(name, value);
                return this;
            };
            return instance.get(name);
        },
        /**
         * 跳转
         * @param  {[type]} url  [description]
         * @param  {[type]} code [description]
         * @return {[type]}      [description]
         */
        redirect: function(url, code){
            this.http.res.statusCode = code || 302;
            this.http.res.setHeader("Location", url);
            this.http.end();
        },
        /**
         * 赋值变量到模版
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        assign: function(name, value){
            if (name === undefined || (is_string(name) && value === undefined)) {
                return this.initView().assign(name);
            };
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
        /**
         * 输出错误
         * @param  {[type]} msg [description]
         * @return {[type]}     [description]
         */
        error: function(msg){
            throw_error(msg, this.http);
        },
        /**
         * 调用另一个controll里的aciton
         * 可以跨分组
         * A("Admin/Test/index")
         * @param  {[type]} action [description]
         * @return {[type]}        [description]
         */
        action: function(action){
            A(action, this.http);
        },
        /**
         * json格式输出，并且支持jsonp的方式
         * @param  {[type]} data  [description]
         * @param  {[type]} jsonp [description]
         * @return {[type]}       [description]
         */
        json: function(data, jsonp){
            this.header("Content-Type", C("json_content_type") + ";charset=" + C("charset"));
            var callback = this.get(C("url_callback_name"));
            //过滤callback值里的非法字符
            callback = callback.replace(/[^\w\.]/g, "");
            if (jsonp && callback) {
                this.echo(callback + "(");
                this.echo(data);
                this.end(")");
            }else{
                this.end(data);
            }
        },
        /**
         * 输出内容
         * 自动JSON.stringify
         * 自定将数字等转化为字符串
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         */
        echo: function(obj, encoding){
            //自动发送Content-Type的header
            if (C('auto_send_content_type') && !this.http.sendContentType) {
                this.header("Content-Type", C("tpl_content_type") + ";charset=" + C("charset"));
            };
            if (is_array(obj) || is_object(obj)) {
                obj = JSON.stringify(obj);
            };
            if (!is_string(obj) && !(obj instanceof Buffer)) {
                obj += "";
            };
            this.http.res.write(obj, encoding || C('encoding'));
        },
        /**
         * 结束输出，输出完成时一定要调用这个方法
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         */
        end: function(obj){
            if (obj) {
                this.echo(obj);
            };
            this.http.end();
        },
        /**
         * 下载文件
         * @return {[type]} [description]
         */
        download: function(file, contentType){
            if (!contentType) {
                var mime = require('mime');
                contentType = mime.lookup(file);
            };
            var http = this.http;
            var fileStream = fs.createReadStream(file);
            http.setHeader("Content-Type", contentType);
            fileStream.pipe(http.res);
            fileStream.on("end", function(){
                http.end();
            })
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