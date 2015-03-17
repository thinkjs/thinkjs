var cluster = require('cluster');
var fs = require('fs');
var domain = require('domain');

var thinkHttp = thinkRequire('Http');
var Dispatcher = thinkRequire('Dispatcher');


var App = module.exports = {};
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
 * 获取action的形参
 * @return {[type]} [description]
 */
App.getActionParams = function(fn, http){
  'use strict';
  //注释的正则
  var commentReg = /((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg;
  //获取形参的正则
  var parsReg = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
  var toString = fn.toString().replace(commentReg, '');
  var match = toString.match(parsReg)[1];
  if (!match) {
    return [];
  }
  match = match.split(/\s*,\s*/);
  //匹配到形参
  return match.map(function(item){
    return http.post[item] || http.get[item] || '';
  });
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
 * run
 * @return {[type]} [description]
 */
App.run = function(){
  'use strict';
  if (APP_MODE && App.mode[APP_MODE]) {
    return App.mode[APP_MODE]();
  }
  return App.mode.http();
};
/**
 * 不同模式下的run
 * @type {Object}
 */
App.mode = {
  //命令行模式
  cli: function(){
    'use strict';
    var defaultHttp = thinkHttp.getDefaultHttp(process.argv[2]);
    thinkHttp(defaultHttp.req, defaultHttp.res).run().then(App.listener);
    var cliTimeout = C('cli_timeout');
    //命令行模式下，超时后自动关闭
    if (cliTimeout) {
      setTimeout(function(){
        console.log('cli exec timeout');
        process.exit();
      }, cliTimeout * 1000);
    }
  },
  //HTTP模式
  http: function(){
    'use strict';
    var clusterNums = C('use_cluster');
    //不使用cluster
    if (!clusterNums) {
      return App.createServer();
    }
    //使用cpu的个数
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
};
/**
 * 创建服务
 * @return {[type]} [description]
 */
App.createServer = function(){
  'use strict';
  //自定义创建server
  var createServerFn = C('create_server_fn');
  if (createServerFn) {
    if (isFunction(createServerFn)) {
      return createServerFn(App);
    }else if (isFunction(global[createServerFn])) {
      return global[createServerFn](App);
    }
  }
  var server = require('http').createServer(function (req, res) {
    thinkHttp(req, res).run().then(App.listener);
  });
  if (C('use_websocket')) {
    thinkRequire('WebSocket')(server, App).run();
  }
  var host = C('host');
  var port = process.argv[2] || C('port'); 
  if (host) {
    server.listen(port, host);
  }else{
    server.listen(port);
  }
  if (APP_DEBUG) {
    console.log('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/');
  }
}
/**
 * 监听回调函数
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
App.listener = function(http){
  'use strict';
  //自动发送thinkjs和版本的header
  http.setHeader('X-Powered-By', 'thinkjs-' + THINK_VERSION);
  //禁止远程直接用带端口的访问,websocket下允许
  if (C('use_proxy') && http.host !== http.hostname && !http.websocket) {
    http.res.statusCode = 403;
    http.res.end();
    return getDefer().promise;
  }
  var domainInstance = domain.create();
  var deferred = getDefer();
  domainInstance.on('error', function(err){
    App.sendError(http, err);
    deferred.reject(err);
  });
  domainInstance.run(function(){
    return tag('app_init', http).then(function(){
      return Dispatcher(http).run();
    }).then(function(){
      return tag('app_begin', http);
    }).then(function(){
      return tag('action_init', http);
    }).then(function(){
      return App.exec(http);
    }).then(function(){
      return tag('app_end', http);
    }).catch(function(err){
      App.sendError(http, err);
    }).then(function(){
      deferred.resolve();
    })
  });
  return deferred.promise;
};