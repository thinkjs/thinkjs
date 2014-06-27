/**
 * 网络方法处理
 * @type {Object}
 */
var querystring = require('querystring');
var url = require('url');
var cookie = thinkRequire('Cookie');
var EventEmitter = require('events').EventEmitter;
var multiparty = require('multiparty');

var localIp = '127.0.0.1';
module.exports = Class(function(){
    'use strict';
    var multiReg = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
    return {
        init: function(req, res){
            this.req = req;
            this.res = res;
            this.http = new EventEmitter();
            //记录当前请求的开始时间
            this.http.startTime = Date.now();
        },
        run: function(callback){
            this._request();
            this._response();
            var method = this.req.method.toLowerCase();
            var methods = ['post', 'put', 'patch'];
            if (methods.indexOf(method) > -1) {
                return this.getPostData(callback);
            }
            return callback && callback(this.http);
        },
        /**
         * 检测含有post数据
         * @return {Boolean} [description]
         */
        hasPostData: function(){
            if ('transfer-encoding' in this.req.headers) {
                return true;
            }
            var contentLength = this.req.headers['content-length'] | 0;
            return contentLength > 0;
        },
        /**
         * 获取POST过来的数据，包含上传的文件
         * 依赖multiparty库
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        getPostData: function(callback){
            //没有post数据，直接回调
            if (!this.hasPostData()) {
                return callback && callback(this.http);
            }
            var self = this;
            var contentType = (this.req.headers['content-type'] || '').split(';')[0].trim();
            var deferred = getDefer();
            //异步获取post数据
            var postDataAsync = C('post_data_async');
            //表单数据提交
            if (multiReg.test(contentType)) {
                var form = new multiparty.Form({
                    maxFieldsSize: C('post_max_fields_size'),
                    maxFields: C('post_max_fields'),
                    maxFilesSize: C('post_max_file_size')
                });
                form.on('file', function(name, value){
                    self.http.file[name] = value;
                });
                form.on('field', function(name, value){
                    self.http.post[name] = value;
                });
                form.on('close', function(){
                    if (postDataAsync) {
                        return deferred.resolve(self.http.post);
                    }
                    return callback && callback(self.http);
                });
                //有错误后直接拒绝当前请求
                form.on('error', function(){
                    self.res.statusCode = 413;
                    self.res.end();
                });
                form.parse(this.req);
            }else{
                var buffer = '';
                this.req.setEncoding(C('encoding'));
                this.req.on('data', function(chunk){
                    buffer += chunk;
                });
                this.req.on('end', function(){
                    //json数据格式
                    var jsonConentType = C('post_json_content_type');
                    if (!isArray(jsonConentType)) {
                        jsonConentType = [jsonConentType];
                    }
                    if (jsonConentType.indexOf(contentType) > -1) {
                        self.http.post = JSON.parse(buffer) || {};
                    }else{
                        self.http.post = querystring.parse(buffer) || {};
                    }
                    //请求内容
                    self.http.payload = buffer;
                    if (postDataAsync) {
                        return deferred.resolve(self.http.post);
                    }
                    return callback && callback(self.http);
                });
            }
            if (postDataAsync) {
                self.http.postPromise = deferred.promise;
                return callback && callback(self.http);
            }
        },
        _request: function(){
            var req = {
                version: this.req.httpVersion,
                method: this.req.method.toLowerCase(),
                headers: this.req.headers,
                getHeader: function(name){
                    return this.headers[name] || '';
                },
                post: {},
                file: {},
                ip: function(){
                    var ip = this.req.connection.remoteAddress || this.req.socket.remoteAddress;
                    if (ip && ip !== localIp) {
                        return ip;
                    }
                    return this.headers['x-forwarded-for'] || this.headers['x-real-ip'] || localIp;
                },
                cookie: cookie.parse(this.req.headers.cookie || '')
            };
            extend(this.http, req);

            //解析url中的参数
            var urlInfo = url.parse('//' + req.headers.host + this.req.url, true, true);
            this.http.pathname = urlInfo.pathname;
            //query只记录?后面的参数
            this.http.query = urlInfo.query;
            //get包含路由解析追加的参数
            this.http.get = extend({}, urlInfo.query);
            //主机名，带端口
            this.http.host = urlInfo.host;
            //主机名，不带端口
            this.http.hostname = urlInfo.hostname;
            //将原生的request对象放在http上，方便后续在controller等地方使用
            this.http.req = this.req;
        },
        _response: function(){
            var res = {
                /**
                 * 一次请求下，可能会发送多个Cookie，所以这里不能立即发送
                 * 需要临时存起来，到输出内容前统一发送
                 * @type {Object}
                 */
                _cookie: {}, 
                /**
                 * 发送header
                 * @param {[type]} name  [description]
                 * @param {[type]} value [description]
                 */
                setHeader: function(name, value){
                    if (this.res.headersSent) {
                        if (APP_DEBUG) {
                            console.log('headers has been sent.', name, value);
                        }
                        return;
                    }
                    this.res.setHeader(name, value);
                },
                /**
                 * 设置cookie
                 * @param {[type]} name    [description]
                 * @param {[type]} value   [description]
                 * @param {[type]} options [description]
                 */
                setCookie: function(name, value, options){
                    options = options || {};
                    if (typeof options === 'number') {
                        options = {timeout: options};
                    }
                    var timeout = options.timeout;
                    if (timeout === undefined) {
                        timeout = C('cookie_timeout');
                    }
                    delete options.timeout;
                    //if value is null, remove cookie
                    if (value === null) {
                        timeout = -1000;
                    }
                    var defaultOptions = {
                        path: C('cookie_path'),
                        domain: C('cookie_domain'),
                        expires: new Date (Date.now() + timeout * 1000)
                    };
                    if (timeout === 0) {
                        delete defaultOptions.expires;
                    }
                    for(var key in options){
                        defaultOptions[key.toLowerCase()] = options[key];
                    }
                    defaultOptions.name = name;
                    defaultOptions.value = encodeURIComponent(value + '');
                    this._cookie[name] = defaultOptions;
                },
                /**
                 * 将队列中的cookie发送出去
                 * @return {[type]} [description]
                 */
                sendCookie: function(){
                    var cookies = Object.values(this._cookie).map(function(item){
                        return cookie.stringify(item.name, item.value, item);
                    });
                    if (cookies.length) {
                        this.setHeader('Set-Cookie', cookies);
                        //发送Cookie后不清除_cookie内容，websocket里需要读取
                        //this._cookie = {};
                    }
                },
                /**
                 * url跳转
                 * @param  {[type]} url  [description]
                 * @param  {[type]} code [description]
                 * @return {[type]}      [description]
                 */
                redirect: function(url, code){
                    this.res.statusCode = code || 302;
                    this.setHeader('Location', url || '/');
                    this.end();
                },
                /**
                 * 发送执行时间
                 * @param  {[type]} name [description]
                 * @return {[type]}      [description]
                 */
                sendTime: function(name){
                    var time = Date.now() - this.startTime;
                    this.setHeader('X-' + name, time + 'ms');
                },
                /**
                 * 输出内容
                 * @param  {[type]} obj      [description]
                 * @param  {[type]} encoding [description]
                 * @return {[type]}          [description]
                 */
                echo: function(obj, encoding){
                    this.sendCookie();
                    if (isArray(obj) || isObject(obj)) {
                        obj = JSON.stringify(obj);
                    }
                    if (!isString(obj) && !(obj instanceof Buffer)) {
                        obj += '';
                    }
                    this.res.write(obj, encoding || C('encoding'));
                },
                /**
                 * 结束URL
                 * @return {[type]} [description]
                 */
                end: function(){
                    this.emit('beforeEnd', this);
                    this.sendCookie();
                    this.res.end();
                    this.emit('afterEnd', this);
                }
            };
            extend(this.http, res);
            //将原生的response对象放在http上，方便后续controller等地方使用
            this.http.res = this.res;
        }
    };
});
/**
 * 获取默认的http信息
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
module.exports.getDefaultHttp = function(data){
    'use strict';
    data = data || {};
    if (isString(data)) {
        if (data[0] === '{') {
            data = JSON.parse(data);
        }else if (/^[\w]+\=/.test(data)) {
            data = querystring.parse(data);
        }else{
            data = {url: data};
        }
    }
    var fn = function(){ 
        return '';
    };
    var url = data.url || '';
    if (url.indexOf('/') !== 0) {
        url = '/' + url;
    }
    return {
        req: {
            httpVersion: '1.1',
            method: data.method || 'GET',
            url: url,
            headers: extend({
                host: data.host || localIp
            }, data.headers || {}),
            connection: {
                remoteAddress: data.ip || localIp
            }
        },
        res: {
            end: data.end || data.close || fn,
            write: data.write || data.send || fn,
            setHeader: fn
        }
    };
};