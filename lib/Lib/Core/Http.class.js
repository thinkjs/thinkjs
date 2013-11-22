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
            this.http = {};
        },
        run: function(callback){
            this._request();
            this._response();
            var method = this.req.method;
            var methods = ["post", "put", "patch"];
            if (methods.indexOf(method) > -1) {
                this.getData(callback);
            }else{
                callback && callback(this.http);
            }
        },
        /**
         * 获取POST过来的数据，包含上传的文件
         * 依赖multiparty库
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getData: function(callback){
            var multiparty = require("multiparty");
            var form = new multiparty.Form();
            var self = this;
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
            this.http.query = urlInfo.query;
            this.http.get = urlInfo.query;
            this.http.host = urlInfo.host;
            this.http.hostname = urlInfo.hostname;
            
            this.http.req = this.req;
        },
        _response: function(){
            var res = {
                setHeader: function(name, value){
                    this.res.setHeader(name, value);
                },
                setCookie: function(name, value, options){
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
                    this.setHeader("Set-Cookie", value);
                },
                end: function(){
                    tag("before_res_end", this);
                    //end前保存session
                    this.session && this.session.flush();
                    this.res.end();
                }
            }
            extend(this.http, res);
            this.http.res = this.res;
        }
    }
});