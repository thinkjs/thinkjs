/**
 * 网络方法处理
 * @type {Object}
 */
var http = require("http");
var querystring = require("querystring");
var url = require("url");
var cookie = require("cookie");

module.exports = Class(function(){
    return {
        req: null,
        res: null,
        http: null,
        init: function(req, res){
            this.req = req;
            this.res = res;
            this.http = {
                startTime: Date.now()
            };
        },
        run: function(callback){
            this._request();
            this._response();
            var method = this.req.method.toLowerCase();
            var methods = ["post", "put", "patch"];
            if (methods.indexOf(method) > -1) {
                this.getData(callback);
            }else{
                callback && callback(this.http);
            }
        },
        /**
         * 检测含有post数据
         * @return {Boolean} [description]
         */
        hasPostData: function(){
            var encoding = 'transfer-encoding' in this.req.headers;
            var length = ('content-length' in this.req.headers) && this.req.headers['content-length'] !== '0';
            return encoding || length;
        },
        /**
         * 获取POST过来的数据，包含上传的文件
         * 依赖multiparty库
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getData: function(callback){
            //没有post数据，直接回调
            if (!this.hasPostData()) {
                return callback && callback(this.http);
            };
            var self = this;
            var multiReg = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
            var contentType = this.req.headers["content-type"] || "";
            //表单数据提交
            if (multiReg.test(contentType)) {
                var multiparty = require("multiparty");
                var form = new multiparty.Form();
                form.on("file", function(name, value){
                    self.http.file[name] = value;
                });
                form.on("field", function(name, value){
                    self.http.post[name] = value;
                });
                form.on("close", function(){
                    callback && callback(self.http);
                });
                form.parse(this.req);
            }else{
                var buffer = "";
                this.req.setEncoding(C('encoding'));
                this.req.on("data", function(chunk){
                    buffer += chunk;
                })
                this.req.on("end", function(){
                    //json数据格式
                    var jsonConentType = C('post_json_content_type');
                    if (!is_array(jsonConentType)) {
                        jsonConentType = [jsonConentType];
                    };
                    //xml数据格式，框架暂无实现
                    //业务可以根据tag: parse_xml 来实现对应的行为
                    var xmlContentType = C('post_xml_content_type');
                    if (!is_array(xmlContentType)) {
                        xmlContentType = [xmlContentType];
                    };
                    if (jsonConentType.indexOf(contentType) > -1) {
                        self.http.post = JSON.parse(buffer) || {};
                    }else if (xmlContentType.indexOf(contentType) > -1) {
                        self.http.post = tag("parse_xml", self.http, buffer);
                    }else{
                        self.http.post = querystring.parse(buffer) || {};
                    }
                    callback && callback(self.http);
                })
            }
        },
        _request: function(){
            var self = this;
            var req = {
                version: this.req.httpVersion,
                method: this.req.method.toLowerCase(),
                headers: this.req.headers,
                getHeader: function(name){
                    if (name == 'referer') {
                        name = 'referrer';
                    };
                    return this.headers[name] || "";
                },
                post: {},
                file: {},
                ip: function(){
                    return this.headers["x-real-ip"] 
                        || this.headers["x-forwarded-for"]
                        || this.req.connection.remoteAddress 
                        || this.req.socket.remoteAddress 
                        || this.req.connection.socket.remoteAddress;
                }
            };

            //cookie
            req.cookie = cookie.parse(this.req.headers.cookie || "");
            extend(this.http, req);
            //解析url中的参数
            var urlInfo = url.parse("//" + req.headers.host + this.req.url, true, true);
            this.http.pathname = urlInfo.pathname;
            //query只记录?后面的参数
            this.http.query = urlInfo.query;
            //get包含路由解析追加的参数
            this.http.get = extend({}, urlInfo.query);
            //主机名，带端口
            this.http.host = urlInfo.host;
            //主机名，不带端口
            this.http.hostname = urlInfo.hostname;
            
            this.http.req = this.req;
        },
        _response: function(){
            var res = {
                /**
                 * 发送header
                 * @param {[type]} name  [description]
                 * @param {[type]} value [description]
                 */
                setHeader: function(name, value){
                    this.res.setHeader(name, value);
                },
                _cookie: {},
                /**
                 * 设置cookie
                 * @param {[type]} name    [description]
                 * @param {[type]} value   [description]
                 * @param {[type]} options [description]
                 */
                setCookie: function(name, value, options){
                    if (name === true) {
                        var cookies = Object.values(this._cookie);
                        if (cookies.length) {
                            this.setHeader("Set-Cookie", cookies);
                            this._cookie = {};
                        };
                        return true;
                    };
                    options = options || {};
                    if (typeof options == 'number') {
                        options = {
                            expires: options
                        }
                    };
                    var expires = options.expires;
                    if (expires === undefined) {
                        expires = C('cookie_expires');
                    };
                    delete options.expires;
                    //if value is null, remove cookie
                    if (value === null) {
                        expires = -1000;
                    };
                    var defaultOptions = {
                        path: "/",
                        expires: new Date (Date.now() + expires)
                    };
                    if (expires === 0) {
                        delete defaultOptions.expires;
                    };
                    options = extend(defaultOptions, options || {});
                    value = cookie.serialize(name, value, options);
                    this._cookie[name] = value;
                },
                /**
                 * url跳转
                 * @param  {[type]} url  [description]
                 * @param  {[type]} code [description]
                 * @return {[type]}      [description]
                 */
                redirect: function(url, code){
                    this.res.statusCode = code || 302;
                    this.res.setHeader("Location", url);
                    this.end();
                },
                /**
                 * 发送执行时间
                 * @param  {[type]} name [description]
                 * @return {[type]}      [description]
                 */
                sendTime: function(name){
                    var time = Date.now() - this.startTime;
                    this.setHeader("X-" + name, time + "ms");
                },
                /**
                 * 输出内容
                 * @param  {[type]} obj      [description]
                 * @param  {[type]} encoding [description]
                 * @return {[type]}          [description]
                 */
                echo: function(obj, encoding){
                    this.setCookie(true);
                    if (is_array(obj) || is_object(obj)) {
                        obj = JSON.stringify(obj);
                    };
                    if (!is_string(obj) && !(obj instanceof Buffer)) {
                        obj += "";
                    };
                    this.res.write(obj, encoding || C('encoding'));
                },
                /**
                 * 结束URL
                 * @return {[type]} [description]
                 */
                end: function(){
                    this.setCookie(true);
                    tag("before_res_end", this);
                    this.res.end();
                }
            }
            extend(this.http, res);
            this.http.res = this.res;
        }
    }
});