/**
 * 网络方法处理
 * @type {Object}
 */
var http = require("http");
var querystring = require("querystring");
var url = require("url");
var tool = think_require("Tool");

var Http = {
    init: function(){
        if (C('use_php_vars')) {
            global.$_GET = {};
            global.$_POST = {};
            global.$_REQUEST = {};
            global.$_FILES = {};
            global.$_COOKIE = {};
            global.$_HTTP = {};
        };
        global.__http = {};
    },
    run: function(callback){
        this.init();
        this._request();
        this._response();
        var method = __http.req.method;
        var methods = ["post", "put", "patch"];
        if (methods.indexOf(method)> -1) {
            if (C('post_data_asyn')) {
                callback && callback();
                this.getData();
            }else{
                this.getData(callback);
            }
        }else{
            callback && callback();
        }
    },
    getData: function(callback){
        var multiparty = require("multiparty");
        var form = new multiparty.Form();
        form.on("file", function(name, value){
            __http.req.file[name] = value;
        });
        form.on("field", function(name, value){
            __http.req.post[name] = value;
        });
        form.on("close", function(){
            callback && callback();
        });
        form.parse(__request);
    },
    _request: function(){
        var req = {
            version: __request.httpVersion,
            statusCode: __request.statusCode,
            status: http.STATUS_CODES[__http.statusCode] || "",
            method: __request.method.toLowerCase(),
            headers: __request.headers,
            getHeader: function(name){
                if (name == 'referer') {
                    name = 'referrer';
                };
                return this.headers[name] || "";
            },
            post: {},
            file: {}
        };
        //cookie
        req.cookie = tool.parseCookie(__request.headers.cookie || "");

        var urlInfo = url.parse(__request.url, true);
        extend(req, urlInfo);
        __http.req = req;
    },
    _response: function(){
        __http.res = {};
    }
};
module.exports = Http;