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
    return think.hook('app_error', this.http, err);
  },
  /**
   * dispath route
   * @return {} []
   */
  dispatcher: function(){
    return this.hook('resource_check').then(() => {
      return this.hook('route_parse');
    }).then(() => {
      this.http._config = think.extend({}, think.getModuleConfig(this.http.module));
    })
  },
  /**
   * exec logic
   * @return {Promise} []
   */
  execLogic: function(){
    var name = this.http.module + '/' + think.dirname.logic + '/' + this.http.controller;
    var cls = think.require(name, true);
    if (!cls) {
      return Promise.resolve();
    }
    var instance = cls(this.http);
    var action = this.http.action;
    if (think.isFunction(instance[action + think.config('action_suffix')])) {
      return this.action(instance, action);
    }
    //call action
    else if (think.isFunction(instance.__call)) {
      return this.action(instance, '__call');
    }
  },
  /**
   * exec controller
   * @return {Promise} []
   */
  execController: function(){
    var http = this.http;
    var name = http.module + '/' + think.dirname.controller + '/' + http.controller;
    var cls = think.require(name, true);
    if (cls) {
      return this.execAction(cls(http));
    }
    var call = 'call_controller';
    cls = think.require(call, true);
    if (cls) {
      return this.execAction(cls(http), true);
    }
    var err = new Error(think.message('CONTROLLER_NOT_FOUND', http.controller, http.url));
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
          var err = new Error(think.message('ACTION_NOT_FOUND', action, this.http.url));
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
    return this.execLogic().then(() => {
      //http is end
      if (this.http._isEnd) {
        return Promise.defer().promise;
      }
      return this.execController();
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
      http.end();
      return;
    }
    var instance = domain.create();
    instance.on('error', (err) => {
      this.error(err);
    });
    instance.run(() => {
      this.dispatcher().then(() => {
        return this.hook('app_begin');
      }).then(() => {
        return this.exec();
      }).then(() => {
        return this.hook('app_end');
      }).catch((err) => {
        this.error(err);
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
    return think.http(req, res).then(function(http){
      app(http).run();
    });
  }
  //define createServer in application
  if (handle) {
    handle(callback, port, host, app);
  }else{
    //create server
    var server = http.createServer(callback);
    if (think.config('websocket.on')) {
      websocket(server, this).run();
    }
    server.listen(port, host);
    App.logPid(port);
  }
  console.log('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/');
  if (think.debug) {
    console.log('app debug is open');
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
   * load process id
   * @return {} []
   */
App.logPid = function(port){
  if (!cluster.isMaster || !think.config('log_pid')) {
    return;
  }
  var dir = think.getModulePath() + '/runtime/pid';
  think.mkdir(dir);
  var pidFile = dir + '/' + port + '.pid';
  fs.writeFileSync(pidFile, process.pid);
  //change pid file mode
  think.chmod(pidFile);
  //remove pid file when process exit
  process.on('SIGTERM', function () {
    if (fs.existsSync(pidFile)) {
      fs.unlinkSync(pidFile);
    }
    process.exit(0);
  });
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
      var err = new Error(think.message('WORKER_DIED', worker.process.pid))
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