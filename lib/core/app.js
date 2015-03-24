'use strict'

var cluster = require('cluster');
var fs = require('fs');
var domain = require('domain');

var thinkHttp = think.require('http');

var App = module.exports = think.Class({
  /**
   * send error
   * @param  {Error} err []
   * @return {}     []
   */
  error: function(err){
    var message = think.isError(error) ? error.stack : error;
    console.error(message);
    if (!http.res) {
      return;
    }
    var http = this.http;
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
      return self.hook('path_parse');
    }).then(function(){
      return self.hook('route_check');
    })
  },
  /**
   * exec
   * @return {Promise} []
   */
  exec: function(){
    var name;
    if (think.mini) {
      name = think.dirname.controller + '/' + this.http.controller;
    }else{
      name = this.http.module + '/' + think.dirname.controller + '/' + this.http.controller;
    }
    if (name in think._aliasExport) {
      return this.execAction(think._aliasExport[name](this.http));
    }
    var call = 'call_controller';
    if (call in think_aliasExport) {
      return this.execAction(think._aliasExport[call](this.http), true);
    }
    var err = new Error('controller `' + this.http.controller + '` not found. url is `' + this.http.url + '` not found');
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
          var err = new Error('action `' + this.http.action + '` not found. url is `' + this.http.url + '`');
          return Promise.reject(err);
        }
        action = call;
      }
    }
    return this.action(controller, action);
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
        console.log('dispatcher.js')
        return self.hook('app_begin');
      }).then(function(){
        return self.hook('action_init');
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
  var server = require('http').createServer(function (req, res) {
    return think.http(req, res).then(function(http){
      return App(http).run();
    });
  });
  if (think.config('use_websocket')) {
    think.require('websocket')(server, this).run();
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
    clusterNums = require('os').cpus().length;
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