'use strict';

var cluster = require('cluster');
var fs = require('fs');
var domain = require('domain');
var os = require('os');
var http = require('http');

var websocket = think.require('websocket');

var App = module.exports = think.Class({
  /**
   * send error
   * @param  {Error} err []
   * @return {}     []
   */
  error: function(err){
    var error = think.config('error');
    if (error.log) {
      think.log(err);
    }
    if (think.mode === 'cli') {
      return;
    }
    var http = this.http;
    var code = error.code || 500;
    var msg = err;
    if (think.isError(err)) {
      msg = think.debug ? err.stack : err.message;
    }
    if (http.isAjax()) {
      return http.fail(code, msg);
    }else if (http.isJsonp()) {
      var key = [error.key, error.msg];
      var value = [code, msg];
      return http.jsonp(think.getObject(key, value));
    }
    var callback = error.callback;
    if (callback) {
      if (!think.isFunction(callback)) {
        callback = global[callback];
      }
      callback(err, http);
    }else{
      http.res.statusCode = code;
      http.type('text/html; charset=' + this.config('encoding'));
      if (think.debug) {
        return http.end('<pre style="font-size:14px;line-height:20px;">' + msg + '</pre>');
      }
      http.sendTime();
      var filepath = think.THINK_LIB_PATH + '/view/error.html'; 
      var readStream = fs.createReadStream(filepath);
      readStream.pipe(http.res);
      readStream.on('end', function(){
        http.res.end();
      });
    }
  },
  /**
   * dispath route
   * @return {} []
   */
  dispatcher: function(){
    var self = this;
    return this.hook('resource_check').then(function(){
      return self.hook('route_parse');
    }).then(function(){
      self.http._config = think.getModuleConfig(self.http.module);
    })
  },
  /**
   * exec logic
   * @return {Promise} []
   */
  execLogic: function(){
    var name;
    if (think.mini) {
      name = think.dirname.logic + '/' + this.http.controller;
    }else{
      name = this.http.module + '/' + think.dirname.logic + '/' + this.http.controller;
    }
    if (name in think._aliasExport) {
      var instance = think._aliasExport[name](this.http);
      var action = this.http.action;
      if (think.isFunction(instance[action + think.config('action_suffix')])) {
        return this.action(instance, action);
      }
      //call action
      else if (think.isFunction(instance.__call)) {
        return this.action(instance, '__call');
      }
    }
    return Promise.resolve();
  },
  /**
   * exec controller
   * @return {Promise} []
   */
  execController: function(){
    var name, http = this.http;
    if (think.mini) {
      name = think.dirname.controller + '/' + http.controller;
    }else{
      name = http.module + '/' + think.dirname.controller + '/' + http.controller;
    }
    if (name in think._aliasExport) {
      return this.execAction(think._aliasExport[name](http));
    }
    var call = 'call_controller';
    if (call in think._aliasExport) {
      return this.execAction(think._aliasExport[call](http), true);
    }
    var err = new Error(think.error('CONTROLLER_NOT_FOUND', http.controller, http.url));
    return Promise.reject(err);
  },
  /**
   * exec action
   * @param  {Object} controller [controller instance]
   * @param  {Boolean} call       [is call controller]
   * @return {Promise}            []
   */
  execAction: function(controller, isCall){
    var action;
    if (isCall) {
      action = think.config('call_action');
    }else{
      action = this.http.action;
      //action not exist
      if (!think.isFunction(controller[action + think.config('action_suffix')])) {
        //__call not exist
        if (!think.isFunction(controller.__call)) {
          var err = new Error(think.error('ACTION_NOT_FOUND', action, this.http.url));
          return Promise.reject(err);
        }
        action = '__call';
      }
    }
    return this.action(controller, action);
  },
  /**
   * exec 
   * @return {Promise} []
   */
  exec: function(){
    var self = this;
    return this.execLogic().then(function(){
      //http is end
      if (self.http._isEnd) {
        return Promise.defer().promise;
      }
      return self.execController();
    })
  },
  /**
   * run
   * @return {} []
   */
  run: function(){
    var http = this.http;
    http.header('X-Powered-By', 'thinkjs-' + think.version);
    //deny access by ip + port
    if (think.config('proxy_on') && http.host !== http.hostname && !http.websocket) {
      http.res.statusCode = 403;
      http.res.end();
      return Promise.defer().promise;
    }
    var instance = domain.create();
    var self = this;
    instance.on('error', function(err){
      self.error(err);
    });
    instance.run(function(){
      self.dispatcher().then(function(){
        return self.hook('app_begin');
      }).then(function(){
        return self.exec();
      }).then(function(){
        return self.hook('app_end');
      }).catch(function(err){
        self.error(err);
      })
    });
  },
})

/**
 * create server
 * @return {} []
 */
App.createServer = function(){
  var app = this;
  var handle = think.config('create_server');
  var host = think.config('host');
  var port = think.port || think.config('port'); 
  //createServer callback
  var callback = function (req, res) {
    think.hook('app_init').then(function(){
      return think.http(req, res);
    }).then(function(http){
      return app(http).run();
    });
  }
  //define createServer in application
  if (handle) {
    if (!think.isFunction(handle)) {
      handle = global[handle];
    }
    return handle(callback, port, host, app);
  }
  //create server
  var server = http.createServer(callback);
  if (think.config('websocket.on')) {
    websocket(server, this).run();
  }
  server.listen(port, host);

  console.log('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/');
}

/**
 * cli mode
 * @return {} []
 */
App.cli = function(){
  think.http(think.url).then(function(http){
    return App(http).listener();
  })
  var timeout = think.config('process_timeout');
  if (timeout) {
    setTimeout(function(){
      process.exit();
    }, timeout * 1000)
  }
}
/**
 * http mode
 * @return {} []
 */
App.http = function(){
  var nums = think.config('cluster_on');
  if (!nums) {
    return App.createServer();
  }
  if (nums === true) {
    nums = os.cpus().length;
  }
  if (cluster.isMaster) {
    console.log('use cluster, fork nums ' + nums);
    for (var i = 0; i < nums; i++) {
      cluster.fork();
    }
    cluster.on('exit', function(worker) {
      var err = new Error(think.error('WORKER_DIED', worker.process.pid))
      think.log(err, 'worker');
      process.nextTick(function(){
        cluster.fork();
      });
    });
  }else {
    App.createServer();
  }
}
/**
 * run
 * @return {} []
 */
App.run = function(){
  if (think.mode === 'cli') {
    return App.cli();
  }
  return App.http();
}