var thinkHttp = thinkRequire('Http');
var url = require('url');
var websocket = require('websocket').server;
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
    getSubProtocal: function(protocolFullCaseMap){
      var selectedProtocal = C('websocket_sub_protocal');
      if (isFunction(selectedProtocal)) {
        var subProtocals = Object.values(protocolFullCaseMap);
        selectedProtocal = selectedProtocal(subProtocals);
      }
      return selectedProtocal;
    },
    /**
     * 建立连接处理
     * @param  {[type]} request [description]
     * @return {[type]}         [description]
     */
    openHandle: function(request, protocal){
      var req = request.httpRequest;
      if (req.url === '/') {
        return getPromise([]);
      }
      var deferred = getDefer();
      var fn = function(){};
      var res = {setHeader: fn, end: fn, write: fn};
      var self = this;
      thinkHttp(req, res).run().then(function(http){
        http.websocket = request.socket;
        //子协议
        http.websocket_sub_protocal = protocal;
        self.app.listener(http).then(function(){
          deferred.resolve({
            cookie: Object.values(http._cookie),
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
    messageHandle: function(message, connection, app, type){
      if (type !== 'utf8') {
        connection.socket.send(WebSocket.ERROR_MESSAGE.TYPE_ERROR, message + ' is not valid json');
        return;
      }
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
          connection.send(JSON.stringify(pars));
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
    run: function(){
      var instance = new websocket({
        httpServer: this.httpServer,
        autoAcceptConnections: false
      });
      var self = this;
      instance.on('request', function(request){
        //检测origin
        if (!self.originIsAllowed(request.origin)) {
          return request.reject();
        }
        var socket = request.socket;
        socket.id = socketId++;
        socket.activeTime = Date.now();
        //选择子协议
        var protocal = self.getSubProtocal(request.protocolFullCaseMap);
        return self.openHandle(request, protocal).then(function(data){
          var connection = socket.connection = request.accept(protocal, request.origin, data.cookie);
          socket.close = function(){
            connection.close();
          }
          if (!socket.send) {
            socket.send = function(data, errMsg){
              var pars = self.getRPCData(data, errMsg);
              connection.send(JSON.stringify(pars));
            }
          }
          var messageHandle = C('websocket_message_handle');
          connection.on('message', function(message) {
            socket.activeTime = Date.now();
            var data = message.type === 'utf8' ? message.utf8Data : message.binaryData;
            if (isFunction(messageHandle)) {
              messageHandle(data, connection, self.app, message.type);
            }else{
              self.messageHandle(data, connection, self.app, message.type);
            }
          });
          connection.on('close', function() {
            data.http.emit('websocket.close');
          });
        }).catch(function(err){
          request.reject(err);
        })
      })
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