'use strict'

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
    think.log(err);
    var http = this.http;
    if (!http.res) {
      return;
    }
    http.res.statusCode = think.config('error_code') || 500;
    http.setHeader('Content-Type', 'text/html; charset=' + think.config('encoding'));
    if (think.debug) {
      http.res.end(message);
    }else{
      var readStream = fs.createReadStream(C('error_tpl_path'));
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
      //merge config to http.config
      var moduleConfig = think.getModuleConfig(self.http.module);
      self.http.config = think.extend({}, think._config, moduleConfig);
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
      }else if (think.isFunction(instance.__call)) {
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
        var call = '__call';
        //__call not exist
        if (!think.isFunction(controller[call])) {
          var err = new Error(think.error('ACTION_NOT_FOUND', action, this.http.url));
          return Promise.reject(err);
        }
        action = call;
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
  var handle = think.config('create_server');
  if (handle) {
    if (think.isFunction(handle)) {
      return handle(this);
    }else if (think.isFunction(global[handle])) {
      return global[handle](this);
    }
  }
  //create server
  var server = http.createServer(function (req, res) {
    return think.hook('app_init').then(function(){
      return think.http(req, res);
    }).then(function(http){
      return App(http).run();
    });
  });
  if (think.config('websocket.on')) {
    websocket(server, this).run();
  }
  var host = think.config('host');
  var port = think.port || think.config('port'); 
  if (host) {
    server.listen(port, host);
  }else{
    server.listen(port);
  }
  if (think.debug) {
    console.log('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/');
  }
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
  var clusterNums = think.config('cluster_on');
  if (!clusterNums) {
    return App.createServer();
  }
  if (clusterNums === true) {
    clusterNums = os.cpus().length;
  }
  if (cluster.isMaster) {
    for (var i = 0; i < clusterNums; i++) {
      cluster.fork();
    }
    cluster.on('exit', function(worker) {
      think.log(new Error('worker ' + worker.process.pid + ' died'), 'worker');
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