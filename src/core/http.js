'use strict';

import url from 'url';
import fs from 'fs';
import mime from 'mime';
import cookie from '../util/cookie.js';

const PAYLOAD_METHODS = ['POST', 'PUT', 'PATCH'];

/**
 * wrap for request & response
 * @type {Object}
 */
export default class {
  /**
   * constructor
   * @return {} []
   */
  constructor(req, res){
    this.init(req, res);
  }
  /**
   * init method
   * @param  {Object} req [request]
   * @param  {Object} res [response]
   * @return {}     []
   */
  init(req, res){
    //request object
    this.req = req;
    //response object
    this.res = res;

    //set http start time
    this.startTime = Date.now();

    this.parseRequest();

    //set request timeout
    let timeout = think.config('timeout');
    this.timeoutTimer = 0;
    if(timeout){
      this.timeoutTimer = res.setTimeout(timeout * 1000, () => {
        let err = new Error('request timeout');
        err.code = 'REQUEST_TIMEOUT';
        this.error = err;
        return think.statusAction(500, this);
      });
    }
  }
  /**
   * parse properties
   * @return {} []
   */
  parseRequest(){
    this.url = this.req.url;
    this.version = this.req.httpVersion;
    this.method = this.req.method;
    this.headers = this.req.headers;
    this.host = this.headers.host || '';
    this.hostname = '';
    this.pathname = '';

    this.query = {};
    this._file = {};
    this._post = {};
    this._cookie = {};
    this._sendCookie = {};
    this._get = {};
    
    //store all other properties
    this._prop = {};
    
    this._contentTypeIsSend = false; //aleady send content-type header
    this._isResource = false; //is resource request
    this._isEnd = false; //request is end

    this._outputContentPromise = [];
    this._view = null; //view instance
    this._session = null; //session instance
    this._lang = ''; //language
    this._langAsViewPath = false; //language as view path
    this._config = null; // config
    this._error = undefined; //error message
    this._theme = undefined; //theme
    this.error = null; //error object
    this._cli = !!think.cli; //cli request
    
    this.module = '';
    this.controller = '';
    this.action = '';

    this.payload = null; //request payload, Buffer
    this.tpl_file = ''; //template file path

    //optimize for homepage request
    if(this.req.url === '/'){
      this.pathname = '/';
      let pos = this.host.indexOf(':');
      this.hostname = pos === -1 ? this.host : this.host.slice(0, pos);
    }else{
      let urlInfo = url.parse('//' + this.host + this.req.url, true, true);
      //can not use decodeURIComponent, pathname may be has encode / chars
      //decodeURIComponent value after parse route
      //remove unsafe chars in pathname
      this.pathname = this.normalizePathname(urlInfo.pathname);
      this.hostname = urlInfo.hostname;
      let query = urlInfo.query;
      if(!think.isEmpty(query)){
        this.query = query;
        this._get = think.extend({}, query);
      } 
    }
  }
  /**
   * get or set property
   */
  prop(name, value){
    if(value === undefined){
      return this._prop[name];
    }
    this._prop[name] = value;
    return this;
  }
  /**
   * exec
   * @return Promise            []
   */
  async run(){
    
    await think.hook.exec('request_begin', this);
    //array indexOf is faster than string
    if (PAYLOAD_METHODS.indexOf(this.req.method) > -1) {
      await this.parsePayload();
    }
    return this;
  }
  /**
   * check request has post data
   * @return {Boolean} []
   */
  hasPayload(){
    if ('transfer-encoding' in this.req.headers) {
      return true;
    }
    return (this.req.headers['content-length'] | 0) > 0;
  }
  /**
   * get payload data
   * @param  {String} encoding [payload data encoding]
   * @return {}          []
   */
  getPayload(encoding = 'utf8'){

    let _getPayload = () => {
      if(this.payload){
        return Promise.resolve(this.payload);
      }
      if(!this.req.readable){
        return Promise.resolve(new Buffer(0));
      }
      let buffers = [];
      let deferred = think.defer();
      this.req.on('data', chunk => {
        buffers.push(chunk);
      });
      this.req.on('end', () => {
        this.payload = Buffer.concat(buffers);
        deferred.resolve(this.payload);
      });
      this.req.on('error', () => {
        this.res.statusCode = 400;
        this.end();
      });
      return deferred.promise;
    };

    return _getPayload().then(buffer => {
      return encoding === true ? buffer : buffer.toString(encoding);
    });
  }
  /**
   * parse payload from request
   * @return {Promise} []
   */
  async parsePayload(){
    if(this.hasPayload()){
      await think.hook('payload_parse', this);
      await think.hook('payload_validate', this);
    }
  }
  
  /**
   * normalize pathname, remove hack chars
   * @param  {String} pathname []
   * @return {String}          []
   */
  normalizePathname(pathname){
    let length = pathname.length;
    let i = 0, chr, result = [], value = '';
    while(i < length){
      chr = pathname[i++];
      if(chr === '/' || chr === '\\'){
        if(value && decodeURIComponent(value)[0] !== '.'){
          result.push(value);
        }
        value = '';
      }else{
        value += chr;
      }
    }
    if(value && decodeURIComponent(value) !== '.'){
      result.push(value);
    }
    return result.join('/');
  }
  /*
   * get or set config
   * @param  {string} name  [config name]
   * @param  {mixed} value [config value]
   * @return {mixed}       []
   */
  config(name, value){
    return think.config(name, value, this._config);
  }
  /**
   * get or set content type
   * @param  {String} ext [file ext]
   * @return {}     []
   */
  type(contentType, encoding){
    if (!contentType) {
      return (this.headers['content-type'] || '').split(';')[0].trim();
    }
    if (this._contentTypeIsSend) {
      return;
    }
    if (contentType.indexOf('/') === -1) {
      contentType = mime.lookup(contentType);
    }
    if (encoding !== false && contentType.toLowerCase().indexOf('charset=') === -1) {
      contentType += '; charset=' + (encoding || this.config('encoding'));
    }
    this.header('Content-Type', contentType);
  }
  /**
   * get user agent
   * @return {String} []
   */
  userAgent(){
    return this.headers['user-agent'] || '';
  }
  /**
   * get page request referrer
   * @param  {String} host [only get referrer host]
   * @return {String}      []
   */
  referrer(host){
    let referer = this.headers.referer || this.headers.referrer || '';
    if (!referer || !host) {
      return referer;
    }
    let info = url.parse(referer);
    return info.hostname;
  }
  /**
   * check http method is get
   * @return {Boolean} []
   */
  isGet(){
    return this.method === 'GET';
  }
  /**
   * check http method is post
   * @return {Boolean} []
   */
  isPost(){
    return this.method === 'POST';
  }
  /**
   * is cli request
   * @return {Boolean} []
   */
  isCli(){
    return this._cli;
  }
  /**
   * is ajax request
   * @param  {String}  method []
   * @return {Boolean}        []
   */
  isAjax(method) {
    if (method && this.method !== method.toUpperCase()) {
      return false;
    }
    return this.headers['x-requested-with'] === 'XMLHttpRequest';
  }
  /**
   * is jsonp request
   * @param  {String}  name [callback name]
   * @return {Boolean}      []
   */
  isJsonp(name){
    name = name || this.config('callback_name');
    return !!this.get(name);
  }
  /**
   * get or set get params
   * @param  {String} name []
   * @return {Object | String}      []
   */
  get(name, value){
    if (value === undefined) {
      if (name === undefined) {
        return this._get;
      }else if (think.isString(name)) {
        //may be value is false or 0
        value = this._get[name];
        if(value === undefined){
          value = '';
        }
        return value;
      }
      this._get = name;
    }else{
      this._get[name] = value;
    }
  }
  /**
   * get or set post params
   * @param  {String} name []
   * @return {Object | String}      []
   */
  post(name, value){
    if (value === undefined) {
      if (name === undefined) {
        return this._post;
      }else if (think.isString(name)) {
        //may be value is false or 0
        value = this._post[name];
        if(value === undefined){
          value = '';
        }
        return value;
      }
      this._post = name;
    }else {
      this._post[name] = value;
    }
  }
  /**
   * get post or get params
   * @param  {String} name []
   * @return {Object | String}      []
   */
  param(name){
    if (name === undefined) {
      return think.extend({}, this._get, this._post);
    }
    return this._post[name] || this._get[name] || '';
  }
  /**
   * get or set file data
   * @param  {String} name []
   * @return {Object}      []
   */
  file(name, value){
    if (value === undefined) {
      if (name === undefined) {
        return think.extend({}, this._file);
      }
      return think.extend({}, this._file[name]);
    }
    this._file[name] = value;
  }
  /**
   * get or set header
   * @param  {String} name  [header name]
   * @param  {String} value [header value]
   * @return {}       []
   */
  header(name, value){
    if (name === undefined) {
      return this.headers;
    }else if (value === undefined) {
      return this.headers[name.toLowerCase()] || '';
    }
    //check content type is send
    if (name.toLowerCase() === 'content-type') {
      if (this._contentTypeIsSend) {
        return;
      }
      this._contentTypeIsSend = true;
    }
    //set header
    if (!this.res.headersSent) {
      this.res.setHeader(name, value);
    }
  }
  /**
   * set http status
   * @param  {Number} status []
   * @return {}        []
   */
  status(status = 200){
    let res = this.res;
    if (!res.headersSent) {
      res.statusCode = status;
    }
    return this;
  }
  /**
   * get uesr ip
   * @return {String} [ip4 or ip6]
   */
  ip(forward){
    let proxy = think.config('proxy_on') || this.host === this.hostname;
    let userIP;
    let localIP = '127.0.0.1';
    if (proxy) {
      if (forward) {
        return (this.headers['x-forwarded-for'] || '').split(',').filter(item => {
          item = item.trim();
          if (think.isIP(item)) {
            return item;
          }
        });
      }
      userIP = this.headers['x-real-ip'];
    }else{
      let connection = this.req.connection;
      let socket = this.req.socket;
      if (connection && connection.remoteAddress !== localIP) {
        userIP = connection.remoteAddress;
      }else if (socket && socket.remoteAddress !== localIP) {
        userIP = socket.remoteAddress;
      }
    }
    if (!userIP) {
      return localIP;
    }
    if (userIP.indexOf(':') > -1) {
      userIP = userIP.split(':').slice(-1)[0];
    }
    if (!think.isIP(userIP)) {
      return localIP;
    }
    return userIP;
  }
  /**
   * get or set language
   * @return {String}           []
   */
  lang(lang, asViewPath){
    if(lang){
      this._lang = lang;
      this._langAsViewPath = asViewPath;
      return;
    }
    //get from property
    if(this._lang){
      return this._lang;
    }
    //get from cookie
    let key = this.config('locale').cookie_name;
    let value = this.cookie(key);
    if(value){
      this._lang = value;
      return value;
    }
    //get from header
    lang = this.header('accept-language');
    //language to lowercase
    this._lang = (lang.split(',')[0] || '').toLowerCase();
    return this._lang;
  }
  /**
   * get or set theme
   * @param  {String} theme []
   * @return {String}       []
   */
  theme(theme){
    if(theme){
      this._theme = theme;
      return;
    }
    return this._theme;
  }
  /**
   * get or set cookie
   * @param  {} name    []
   * @param  {} value   []
   * @param  {} options []
   * @return {}         []
   */
  cookie(name, value, options){
    //send cookies
    if (name === true) {
      if (think.isEmpty(this._sendCookie)) {
        return;
      }
      let cookies = Object.values(this._sendCookie).map((item) => {
        return cookie.stringify(item.name, item.value, item);
      });
      this.header('Set-Cookie', cookies);
      this._sendCookie = {};
      return;
    }
    //parse cookie
    if(think.isEmpty(this._cookie) && this.headers.cookie){
      this._cookie = cookie.parse(this.headers.cookie);
    }
    if (name === undefined) {
      return this._cookie;
    }else if (value === undefined) {
      return this._cookie[name] || this._sendCookie[name] && this._sendCookie[name].value || '';
    }
    //set cookie
    if (typeof options === 'number') {
      options = {timeout: options};
    }
    options = think.extend({}, this.config('cookie'), options);
    if (value === null) {
      options.timeout = -1000;
    }
    if (options.timeout !== 0) {
      options.expires = new Date(Date.now() + options.timeout * 1000);
    }
    if(options.timeout > 0){
      options.maxage = options.timeout;
    }
    options.name = name;
    options.value = value;
    this._sendCookie[name] = options;
  }
  /**
   * redirect
   * @param  {String} url  [redirect url]
   * @param  {Number} code []
   * @return {}      []
   */
  redirect(url, code){
    this.res.statusCode = code || 302;
    this.header('Location', url || '/');
    this.end();
  }
  /**
   * send time
   * @param  {String} name [time type]
   * @return {}      []
   */
  sendTime(name){
    let time = Date.now() - this.startTime;
    this.header('X-' + (name || 'EXEC-TIME'), time + 'ms');
  }
  /**
   * output with success errno & errmsg
   * @param  {Object} data    [output data]
   * @param  {String} message [errmsg]
   * @return {Promise}         [pedding promise]
   */
  success(data = '', message = ''){
    let error = this.config('error');
    let obj = {
      [error.key]: 0,
      [error.msg]: message,
      data: data
    };
    this.type(this.config('json_content_type'));
    this.end(obj);
  }
  /**
   * output with fail errno & errmsg
   * @param  {Number} errno  [error number]
   * @param  {String} errmsg [error message]
   * @param  {Object} data   [output data]
   * @return {Promise}        [pedding promise]
   */
  fail(errno, errmsg = '', data = ''){
    let obj;
    let error = this.config('error');
    if (think.isObject(errno)) {
      obj = think.extend({}, errno);
    }else{
      if(/^[A-Z\_]+$/.test(errno)){
        let msg = this.locale(errno);
        if(think.isArray(msg)){
          errno = msg[0];
          errmsg = msg[1];
        }
      }
      if (!think.isNumber(errno)) {
        data = errmsg;
        errmsg = errno;
        errno = error.default_errno;
      }
      //read errmsg from config/locale/[lang].js
      if(!errmsg){
        errmsg = this.locale(errno) || '';
      }
      obj = {
        [error.key]: errno,
        [error.msg]: errmsg
      };
      if(data){
        obj.data = data;
      }
    }
    this.type(this.config('json_content_type'));
    this.end(obj);
  }
  /**
   * output with jsonp
   * @param  {Object} data [output data]
   * @return {}      []
   */
  jsonp(data) {
    this.type(this.config('json_content_type'));
    let callback = this.get(this.config('callback_name'));
    //remove unsafe chars
    callback = callback.replace(/[^\w\.]/g, '');
    if (callback) {
      data = callback + '(' + (data !== undefined ? JSON.stringify(data) : '') + ')';
    }
    this.end(data);
  }
  /**
   * output with json
   * @param  {Object} data [output data]
   * @return {Promise}      []
   */
  json(data){
    this.type(this.config('json_content_type'));
    this.end(data);
  }
  /**
   * get view instance
   * @return {Object} []
   */
  view(){
    if (!this._view) {
      let cls = think.require('view');
      this._view = new cls(this);
    }
    return this._view;
  }
  /**
   * set cache-control and expires header
   * @return {} []
   */
  expires(time){
    time = time * 1000;
    let date = new Date(Date.now() + time);
    this.header('Cache-Control', `max-age=${time}`);
    this.header('Expires', date.toUTCString());
  }
  /**
   * get locale value
   * @param  {String} key []
   * @return {String}     []
   */
  locale(){
    return think.locale.apply(this, arguments);
  }
   /**
   * get or set session
   * @param  {String} name  [session name]
   * @param  {mixed} value [session value]
   * @return {Promise}       []
   */
  session(name, value) {
    think.session(this);
    let instance = this._session;
    if (name === undefined) {
      return instance.delete();
    }
    if (value !== undefined) {
      return instance.set(name, value);
    }
    return instance.get(name);
  }
  /**
   * write content
   * @param  {mixed} obj      []
   * @param  {String} encoding []
   * @return {Promise}          []
   */
  write(obj, encoding = this.config('encoding')){
    if(!this.res.connection){
      return;
    }
    this.type(this.config('view.content_type'));
    this.cookie(true);
    if (obj === undefined) {
      return;
    }
    if(think.isPromise(obj)){
      //ignore Content-Type header before set
      this._contentTypeIsSend = false;
      throw new Error('can not write promise');
    }
    if (think.isArray(obj) || think.isObject(obj)) {
      obj = JSON.stringify(obj);
    }else if (!think.isBuffer(obj)) {
      obj += '';
    }
    
    //write after end
    if(this._isEnd){
      if(think.isBuffer(obj)){
        think.log('write after end, content is buffer', 'WARNING');
      }else{
        let pos = obj.indexOf('\n');
        if(pos > -1){
          obj = obj.slice(0, pos) + '...';
        }
        think.log('write after end, content is `' + obj + '`', 'WARNING');
      }
      return;
    }
    let outputConfig = this.config('output_content');
    if (!outputConfig) {
      return this.res.write(obj, encoding);
    }
    let fn = think.co.wrap(outputConfig);
    let promise = fn(obj, encoding, this);
    this._outputContentPromise.push(promise);
  }
  /**
   * end
   * @return {} []
   */
  _end(){
    this.cookie(true);
    this.res.end();
    
    process.nextTick(() => {
      this._afterEnd();
    });
  }
  /**
   * after end
   * @return {} []
   */
  _afterEnd(){
    //flush session
    if(this._session && this._session.flush){
      this._session.flush();
    }

    //show request info
    if(this.config('log_request') && !this._isResource){
      think.log(colors => {
        let msg = [
          this.method, this.url,
          colors.cyan(`${this.res.statusCode}`)
        ].join(' ');
        return msg;
      }, 'HTTP', this.startTime);
    }

    //remove upload tmp files
    if (!think.isEmpty(this._file)) {
      var key, filepath;
      for(key in this._file){
        filepath = this._file[key].path;
        if (think.isFile(filepath)) {
          fs.unlink(filepath, () => {});
        }
      }
    }
  }
  /**
   * http end
   * @return {} []
   */
  end(obj, encoding){
    if(this._isEnd){
      return;
    }
    if(this.timeoutTimer){
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = 0;
    }
    this.write(obj, encoding);
    //set http end flag
    this._isEnd = true;
    if (!this._outputContentPromise.length) {
      return this._end();
    }

    return Promise.all(this._outputContentPromise).then(() => {
      this._outputContentPromise = [];
      this._end();
    }).catch(() => {
      this._end();
    });
  }
}
