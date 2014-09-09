var thinkHttp = thinkRequire('Http');
var url = require('url');
var websocket = require('websocket-driver');
var querystring = require('querystring');

var WebSocket = module.exports = Class(function(){
  'use strict';
  /**
   * socket初始化id
   * @type {Number}
   */
  var socketId = 1000;
  return {
    init: function(httpServer, app){
      this.httpServer = httpServer;
      this.app = app;
    },
    /**
     * 检测origin是否合法
     * @param  {[type]} origin [description]
     * @return {[type]}        [description]
     */
    originIsAllowed: function(origin){
      var allowOrigins = C('websocket_allow_origin');
      if (!allowOrigins) {
        return true;
      }
      var info = url.parse(origin);
      var hostname = info.hostname;
      if (isString(allowOrigins) && allowOrigins === hostname) {
        return true;
      }else if (isArray(allowOrigins) && allowOrigins.indexOf(hostname) > -1) {
        return true;
      }else if (isFunction(allowOrigins)) {
        return allowOrigins(hostname, info);
      }
      return false;
    },
    /**
     * 选择子协议
     * @param  {[type]} protocolFullCaseMap [description]
     * @return {[type]}                     [description]
     */
    getSubProtocal: function(request){
      var selectedProtocal = C('websocket_sub_protocal');
      if (isFunction(selectedProtocal)) {
        var protocals = (request.headers['sec-websocket-protocol'] || '').split(/,\s*/);
        selectedProtocal = selectedProtocal(protocals);
      }
      return selectedProtocal;
    },
    /**
     * 建立连接处理
     * @param  {[type]} request [description]
     * @return {[type]}         [description]
     */
    openHandle: function(request, protocal){
      if (request.url === '/') {
        return getPromise({});
      }
      var deferred = getDefer();
      var fn = function(){};
      var cookies = '';
      var res = {setHeader: function(name, value){
        if (name === 'Set-Cookie' && value) {
          cookies = value;
        }
      }, end: fn, write: fn};

      var self = this;
      thinkHttp(request, res).run().then(function(http){
        http.websocket = request.socket;
        //子协议
        http.websocket_sub_protocal = protocal;
        self.app.listener(http).then(function(){
          http.sendCookie();
          deferred.resolve({
            cookie: cookies,
            http: http
          });
        }).catch(function(err){
          deferred.reject(err);
        })
      });
      return deferred.promise;
    },
    /**
     * 消息处理
     * @return {[type]} [description]
     */
    messageHandle: function(message, connection, app){
      //解析数据
      try{
        message = JSON.parse(message);
      }catch(e){
        connection.socket.send(WebSocket.ERROR_MESSAGE.INVALID_JSON, message + ' is not valid json');
        return;
      }
      if (message.jsonrpc !== '2.0') {
        connection.socket.send(WebSocket.ERROR_MESSAGE.INVALID_JSONRPC, 'data.jsonrpc must be 2.0');
        return;
      }
      var method = message.method + '';
      if (!method) {
        connection.socket.send(WebSocket.ERROR_MESSAGE.INVALID_METHOD, 'data.method is not valid');
        return;
      }
      var pars = message.params;
      var headers = {};
      if (isObject(message.params.headers)) {
        headers = message.params.headers;
        pars = message.params.data;
      }
      if (isObject(pars)) {
        method += (method.indexOf('?') > -1 ? '&' : '?') + querystring.stringify(pars)
      }
      var self = this;
      var data = {
        host: '',
        url: method,
        headers: headers,
        write: function(data, encoding, errMsg){
          var pars = self.getRPCData(JSON.parse(data), errMsg);
          pars.id = message.id;
          connection.socket.send(JSON.stringify(pars));
        },
        end: function(data){
          if (data) {
            this.write(data);
          }
          connection.close();
        }
      }
      var defaultHttp = thinkHttp.getDefaultHttp(data);
      var httpInstance = thinkHttp(defaultHttp.req, defaultHttp.res);
      //将websocket实例添加到http对象上
      httpInstance.http.websocket = connection.socket;
      httpInstance.run().then(app.listener);
    },
    /**
     * 获取rpc数据对象
     * @param  {[type]} data   [description]
     * @param  {[type]} errMsg [description]
     * @return {[type]}        [description]
     */
    getRPCData: function(data, errMsg){
      var pars = {jsonrpc: '2.0'};
      if (errMsg) {
        pars.error = {code: data, message: errMsg};
      }else{
        pars.result = data;
      }
      return pars;
    },
    open: function(request){
      var self = this;
      var protocal = this.getSubProtocal(request);
      return this.openHandle(request, protocal).then(function(data){
        var driver = websocket.http(request, {
          protocols: protocal
        });
        var socket = driver.socket = request.socket;
        driver.send = function(data){
          return isBuffer(data) ? driver.binary(data) : driver.text(data);
        }
        socket.close = function(){
          driver.close();
        }
        socket.connection = driver;
        if (!socket.send) {
          socket.send = function(data, errMsg){
            var pars = self.getRPCData(data, errMsg);
            driver.text(JSON.stringify(pars));
          }
        }
        socket.pipe(driver.io).pipe(socket);
        var messageHandle = C('websocket_message_handle');
        driver.messages.on('data', function(message) {
          socket.activeTime = Date.now();
          var type = isBuffer(message) ? 'buffer' : 'text';
          if (isFunction(messageHandle)) {
            messageHandle(message, driver, self.app, type);
          }else{
            self.messageHandle(message, driver, self.app, type);
          }
        });
        driver.on('close', function(){
          return data.http && data.http.emit('websocket.close');
        })
        //设置cookie
        if (!isEmpty(data.cookie)) {
          driver.setHeader('Set-Cookie', data.cookie);
        }
        driver.start();
      })
    },
    run: function(){
      var self = this;
      this.httpServer.on('upgrade', function(request, socket) {
        if (!websocket.isWebSocket(request)){
          return;
        }
        var origin = request.headers.origin;
         if (!self.originIsAllowed(origin)) {
          return;
        }
        socket.id = socketId++;
        socket.activeTime = Date.now();
        return self.open(request);
      });
    }
  }
});
/**
 * 错误信息
 * @type {Object}
 */
WebSocket.ERROR_MESSAGE = {
  TYPE_ERROR: -100001, //数据类型错误
  INVALID_JSON: -100002, //不是合法的json
  INVALID_JSONRPC: -100003, //不是jsonrpc数据格式
  INVALID_METHOD: -100004 //请求方法不合法
}