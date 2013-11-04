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
            if (methods.indexOf(method)> -1) {
                this.getData(callback);
            }else{
                callback && callback(this.http);
            }
        },
        getData: function(callback){
            var multiparty = require("multiparty");
            var form = new multiparty.Form();
            var self = this;
            form.on("file", function(name, value){
                self.http.req.file[name] = value;
            });
            form.on("field", function(name, value){
                self.http.req.post[name] = value;
            });
            form.on("close", function(){
                callback && callback(self.http);
            });
            form.parse(this.req);
        },
        _request: function(){
            var req = {
                version: this.req.httpVersion,
                statusCode: this.req.statusCode,
                status: http.STATUS_CODES[this.req.statusCode] || "",
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
                ip: this.req.headers["x-real-ip"] || this.req.headers["x-forwarded-for"]
            };

            //cookie
            req.cookie = cookie.parse(this.req.headers.cookie || "");

            var urlInfo = url.parse(this.req.url, true);
            extend(req, urlInfo);
            this.http.req = req;
            this.http._req = this.req;
        },
        _response: function(){
            var self = this;
            var res = {
                setHeader: function(name, value){
                    self.res.setHeader(name, value);
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
                        expires = -10;
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
                }
            }
            this.http.res = res;
            this.http._res = this.res;
        }
    }
});