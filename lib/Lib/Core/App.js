var cluster = require('cluster');
var fs = require('fs');
var domain = require('domain');

var thinkHttp = thinkRequire('Http');
var Dispatcher = thinkRequire('Dispatcher');

//注释的正则
var commentReg = /((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg;
//获取形参的正则
var parsReg = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;


var App = module.exports = {};
/**
 * 根据http里的group和controller获取对应的controller实例
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
App.getBaseController = function(http){
  'use strict';
  var gc = ucfirst(http.group) + '/' + ucfirst(http.controller) + 'Controller';
  var path = getThinkRequirePath(gc);
  if (path) {
    return require(path)(http);
  }
}
/**
 * controller不存在时调用的默认controller
 * @return {[type]} [description]
 */
App.getCallController = function(http){
  'use strict';
  var config = C('call_controller');
  if (!config) {
    return;
  }
  if (isString(config)) {
    config = config.split(':');
  }
  var action = Dispatcher.getAction(config.pop());
  var controller = Dispatcher.getController(config.pop());
  var group = Dispatcher.getGroup(config.pop());
  var instance = this.getBaseController({
    group: group,
    controller: controller
  })
  if (instance && isFunction(instance[action + C('action_suffix')])) {
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
    return getPromise('action `' + action + '` not found. ', true);
  }
  var promise = getPromise();
  //action前置操作
  var before = C('before_action');
  if (before && isFunction(controller[before])) {
    promise = controller[before](action);
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
  var toString = fn.toString().replace(commentReg, '');
  var match = toString.match(parsReg)[1].split(/\s*,\s*/);
  //匹配到形参
  var params;
  if (match && match.length) {
    params = match.map(function(item){
      return http.post[item] || http.get[item] || '';
    });
  }
  return params;
}
/**
 * 执行
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
App.exec = function(http){
  'use strict';
  var controller = this.getBaseController(http) || this.getCallController(http);
  //controller不存在
  if (!controller) {
    var err = new Error('Controller `' + http.controller + '` not found. ' + http.pathname);
    return getPromise(err, true);
  }
  var params;
  var actionFn = controller[http.action + C('action_suffix')];
  //参数绑定
  if (C('url_params_bind') && isFunction(actionFn)) {
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
  var message = isError(error) ? error.stack : error;
  console.log(message);
  if (!http.res) {
    return;
  }
  if (APP_DEBUG) {
    http.res.statusCode = 500;
    http.res.end(message);
  }else{
    http.res.statusCode = 500;
    http.setHeader('Content-Type', 'text/html; charset=' + C('encoding'));
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
  };
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
    thinkHttp(defaultHttp.req, defaultHttp.res).run(App.listener);
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
        console.log('worker ' + worker.process.pid + ' died');
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
    thinkHttp(req, res).run(App.listener);
  });
  thinkRequire('WebSocket')(server, App).run();
  server.listen(C('port'));
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