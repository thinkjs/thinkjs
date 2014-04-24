/**
 * Controller 基类
 * @return {[type]} [description]
 */
var fs = require("fs");
var path = require("path");
module.exports = Class(function() {
    "use strict";
    //callback正则
    var callbackReg = /[^\w\.]/g;

    return {
        /**
         * 初始化执行方法
         * @param  {[type]} http [description]
         * @return {[type]}      [description]
         */
        init: function(http) {
            this.http = http;
            this.view = null;
            //将http数据打到模版里
            this.assign("http", this.http);
            //将配置信息打到模版里
            this.assign("config", C());
        },
        /**
         * 获取客户端的ip
         * @return {[type]} [description]
         */
        ip: function() {
            return this.http.ip();
        },
        /**
         * 实例化View类
         * @return {[type]} [description]
         */
        initView: function() {
            if (!this.view) {
                this.view = thinkRequire("View")(this.http);
            }
            return this.view;
        },
        /**
         * 是否是GET请求
         * @return {Boolean} [description]
         */
        isGet: function() {
            return this.http.method === 'get';
        },
        /**
         * 是否是POST请求
         * @return {Boolean} [description]
         */
        isPost: function() {
            return this.http.method === 'post';
        },
        /**
         * 是否是特定METHOD请求
         * @param  {[type]}  method [description]
         * @return {Boolean}        [description]
         */
        isMethod: function(method) {
            return this.http.method === method;
        },
        /**
         * 是否是AJAX请求
         * @return {Boolean} [description]
         */
        isAjax: function() {
            return this.header("X-Requested-With").toLowerCase() === "xmlhttprequest";
        },
        /**
         * 获取QUERY参数
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        get: function(name) {
            if (name === undefined) {
                return this.http.get;
            }
            return this.http.get[name] || "";
        },
        /**
         * 获取POST参数
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        post: function(name) {
            if (name === undefined) {
                return this.http.post;
            }
            return this.http.post[name] || "";
        },
        /**
         * 获取参数
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        param: function(name) {
            return this.post(name) || this.get(name);
        },
        /**
         * 获取上传的文件
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        file: function(name) {
            return this.http.file[name] || {};
        },
        /**
         * header操作
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        header: function(name, value) {
            if (isObject(name)) {
                for (var key in name) {
                    this.header(key, name[key]);
                }
                return this;
            }
            if (value !== undefined) {
                //对是否发送了Content-Type头信息进行标记
                if (name.toLowerCase() === 'content-type') {
                    if (value.toLowerCase().indexOf("charset=") === -1) {
                        value += "; charset=" + C("encoding");
                    }
                    //Content-Type Header is Send
                    this.http.cthIsSend = true;
                }
                this.http.setHeader(name, value);
                return this;
            }
            if (name === undefined) {
                return this.http.headers;
            }
            return this.http.getHeader(name);
        },
        /**
         * 获取userAgent
         * @return {[type]} [description]
         */
        userAgent: function(){
            return this.header("user-agent");
        },
        /**
         * 获取referrer
         * @return {[type]} [description]
         */
        referrer: function(){
            return this.header("referrer");
        },
        /**
         * cookie操作
         * @param  {[type]} name    [description]
         * @param  {[type]} value   [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        cookie: function(name, value, options) {
            if (value !== undefined) {
                this.http.setCookie(name, value, options);
                return this;
            }
            if (name === undefined) {
                return this.http.cookie;
            }
            return this.http.cookie[name];
        },
        /**
         * session
         * 如果是get操作，则返回一个promise
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        session: function(name, value) {
            thinkRequire('Session').start(this.http);
            var instance = this.http.session;
            if (name === undefined) {
                return instance.rm();
            }
            if (value !== undefined) {
                return instance.set(name, value);
            }
            return instance.get(name);
        },
        /**
         * 跳转
         * @param  {[type]} url  [description]
         * @param  {[type]} code [description]
         * @return {[type]}      [description]
         */
        redirect: function(url, code) {
            this.http.redirect(url, code);
            return getDefer().promise;
        },
        /**
         * 赋值变量到模版
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        assign: function(name, value) {
            return this.initView().assign(name, value);
        },
        /**
         * 获取解析后的模版内容
         * @param  {[type]} templateFile [description]
         * @param  {[type]} content      [description]
         * @return {[type]}              [description]
         */
        fetch: function(templateFile, content) {
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
        display: function(templateFile, charset, contentType, content) {
            return this.initView().display(templateFile, charset, contentType, content);
        },
        /**
         * 调用另一个controll里的aciton
         * 可以跨分组
         * A("Admin/Test/index")
         * @param  {[type]} action [description]
         * @return {[type]}        [description]
         */
        action: function(action) {
            A(action, this.http);
        },
        /**
         * jsonp格式输出
         * @param  {[type]} data  [description]
         * @param  {[type]} jsonp [description]
         * @return {[type]}       [description]
         */
        jsonp: function(data) {
            this.header("Content-Type", C("json_content_type"));
            var callback = this.get(C("url_callback_name"));
            //过滤callback值里的非法字符
            callback = callback.replace(callbackReg, "");
            if (callback) {
                this.echo(callback + "(");
                this.echo(data);
                this.end(")");
            } else {
                this.end(data);
            }
        },
        /**
         * json格式输出
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        json: function(data){
            this.end(data);
        },
        /**
         * 设置http响应状态码
         * @param  {[type]} status [description]
         * @return {[type]}        [description]
         */
        status: function(status) {
            var res = this.http.res;
            if (!res.headersSent) {
                res.statusCode = status || 404;
            }
        },
        /**
         * 输出内容
         * 自动JSON.stringify
         * 自定将数字等转化为字符串
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         */
        echo: function(obj, encoding) {
            //自动发送Content-Type的header
            if (C('auto_send_content_type') && !this.http.cthIsSend) {
                this.header("Content-Type", C("tpl_content_type"));
            }
            this.http.echo(obj, encoding);
        },
        /**
         * 结束输出，输出完成时一定要调用这个方法
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         */
        end: function(obj) {
            if (obj) {
                this.echo(obj);
            }
            this.http.end();
        },
        /**
         * 下载文件
         * @return {[type]} [description]
         */
        download: function(file, contentType) {
            if (!contentType) {
                var mime = require('mime');
                contentType = mime.lookup(file);
            }
            var http = this.http;
            var fileStream = fs.createReadStream(file);
            http.setHeader("Content-Type", contentType);
            http.setHeader("Content-Disposition", 'attachment; filename="' + path.basename(file) + '"');
            fileStream.pipe(http.res);
            fileStream.on("end", function() {
                http.end();
            });
        },
        /**
         * 正常json数据输出
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        success: function(data){
            var obj = getObject([C('error_no_key'), C('error_msg_key')], [0, ""]);
            obj.data = data || "";
            this.header("Content-Type", C('json_content_type'));
            this.end(obj);
        },
        /**
         * 异常json数据数据
         * @param  {[type]} errno  [description]
         * @param  {[type]} errmsg [description]
         * @param  {[type]} extra  [description]
         * @return {[type]}        [description]
         */
        error: function(errno, errmsg, data){
            var obj = getObject([C('error_no_key'), C('error_msg_key')], [errno, errmsg]);
            obj.data = data;
            this.header("Content-Type", C('json_content_type'));
            this.end(obj);
        },
        /**
         * 对数据进行过滤
         * @param  {[type]} data [description]
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        filter: function() {
            var filter = thinkRequire("Filter").filter;
            return filter.apply(null, arguments);
        },
        /**
         * 校验一个值是否合法
         * @param  {[type]} data      [description]
         * @param  {[type]} validType [description]
         * @return {[type]}           [description]
         */
        valid: function(data, validType) {
            //单个值检测，只返回是否正常
            if (validType !== undefined) {
                data = {
                    value: data,
                    valid: validType
                };
                var result = thinkRequire("Valid").check(data);
                return result.length === 0;
            }
            return thinkRequire("Valid").check(data);
        }
    };
});