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
    var name = this.http.module + '/' + think.dirname.controller + '/' + this.http.controller;
    if (think.mini) {
      name = think.dirname.controller + '/' + this.http.controller;
    }
    if (name in think._aliasExport) {
      return this.execAction(think._aliasExport[name](this.http));
    }
    var call = 'call_controller';
    if (call in think_aliasExport) {
      return this.execAction(think._aliasExport[call](this.http), true);
    }
    var err = new Error('url `' + this.http.url + '` not found');
    return Promise.reject(err);
  },
  /**
   * exec action
   * @param  {Object} controller [controller instance]
   * @param  {Boolean} call       [is call controller]
   * @return {Promise}            []
   */
  execAction: function(controller, call){
    var action = this.http.action;
    if (call) {
      action = think.config('call_action');
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
 * 根据http里的group和controller获取对应的controller实例
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
App.getBaseController = function(http, options, checkAction, ignoreCall){
  'use strict';
  options = options || {};
  var group = options.group || http.group;
  var controller = options.controller || http.controller;
  if (!controller) {
    return;
  }
  var gc = group + '/' + controller + 'Controller';
  var path = getThinkRequirePath(gc);
  if (!path) {
    return;
  }
  var instance = require(path)(http);
  if (!checkAction) {
    return instance;
  }
  var action = options.action || http.action;
  //action对应的方法或者call方法存在
  if (isFunction(instance[action + C('action_suffix')])) {
    return instance;
  }
  if (!ignoreCall && isFunction(instance[C('call_method')])) {
    return instance;
  }
}
/**
 * controller不存在时调用的默认controller
 * @return {[type]} [description]
 */
App.getCallController = function(http){
  'use strict';
  //如果是RESTFUL API，则调用RestController
  if (http.isRestful) {
    return thinkRequire('RestController')(http);
  }
  var config = C('call_controller');
  if (!config) {
    return;
  }
  config = config.split(':');
  var group = ucfirst(config[0]);
  var controller = ucfirst(config[1]);
  var action = config[2];
  var instance;
  instance = this.getBaseController(http, {
    group: group,
    controller: controller,
    action: action
  }, true, true);
  if (instance) {
    http._group = http.group;
    http._controller = http.controller;
    http._action = http.action;
    
    http.group = group;
    http.controller = controller;
    http.action = action;
  }
  return instance;
}

/**
 * 执行具体的action，调用前置和后置操作
 * @return {[type]} [description]
 */
App.execAction = function(controller, action, data, callMethod){
  'use strict';
  //action操作
  var act = action + C('action_suffix');
  var flag = false;
  //action不存在时执行魔术方法
  if (callMethod && !isFunction(controller[act])) {
    var call = C('call_method');
    if (call && isFunction(controller[call])) {
      flag = true;
      act = call;
    }
  }
  //action不存在
  if (!isFunction(controller[act])) {
    return getPromise(new Error('action `' + action + '` not found.'), true);
  }
  var promise = getPromise();
  //action前置操作
  var before = C('before_action');
  if (before && isFunction(controller[before])) {
    promise = getPromise(controller[before](action));
  }
  promise = promise.then(function(){
    //action魔术方法只传递action参数
    if (flag) {
      return controller[act](action);
    }
    if (data) {
      return controller[act].apply(controller, data);
    }else{
      return controller[act]();
    }
  });
  //action后置操作
  var after = C('after_action');
  if (after && isFunction(controller[after])) {
    promise = promise.then(function(){
      return controller[after](action);
    })
  }
  return promise;
}

/**
 * 执行
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
App.exec = function(http){
  'use strict';
  var controller = this.getBaseController(http, {}, true) || this.getCallController(http);
  //controller或者action不存在
  if (!controller) {
    var path = getThinkRequirePath(ucfirst(http.group) + '/' + ucfirst(http.controller) + 'Controller');
    var cmessage;
    if (path) {
      cmessage = 'action `' + http.action + '` not found.';
    }else{
      cmessage = 'Controller' + (http.controller ? ' `' + http.controller + '`' : '') + ' not found.';
    }
    var err = new Error(cmessage + ' pathname is `' + http.pathname + '`');
    return getPromise(err, true);
  }
  var params;
  var actionFn = controller[http.action + C('action_suffix')];
  //参数绑定
  if (actionFn && C('url_params_bind')) {
    params = this.getActionParams(actionFn, http);
  }
  var promise = getPromise(controller.__initReturn);
  var self = this;
  return promise.then(function(){
    return self.execAction(controller, http.action, params, true);
  })
}
/**
 * 发送错误信息
 * @param  {[type]} error [description]
 * @return {[type]}       [description]
 */
App.sendError = function(http, error){
  'use strict';
  if (!error) {
    return;
  }
  var message = isError(error) ? error.stack : error;
  console.error(message);
  if (!http.res) {
    return;
  }
  http.res.statusCode = C('error_code') || 500;
  http.setHeader('Content-Type', 'text/html; charset=' + C('encoding'));
  if (APP_DEBUG) {
    http.res.end(message);
  }else{
    var readStream = fs.createReadStream(C('error_tpl_path'));
    readStream.pipe(http.res);
    readStream.on('end', function(){
      http.res.end();
    });
  }
}


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
      console.error('worker ' + worker.process.pid + ' died');
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