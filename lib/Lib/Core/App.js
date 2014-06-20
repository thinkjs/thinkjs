var cluster = require("cluster");
var fs = require("fs");
var domain = require("domain");
var thinkHttp = thinkRequire("Http");
var Dispatcher = thinkRequire('Dispatcher');

/**
 * 应用程序
 * @type {Object}
 */
var App = module.exports = Class(function(){
	"use strict";
	//controller和action的校验正则
	var nameReg = /^[A-Za-z\_](\w)*$/;
	//注释的正则
	var commentReg = /((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg;
	//获取形参的正则
	var parsReg = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;

	return {
		init: function(http){
			this.http = http;
		},
		/**
		 * 解析路由
		 * @return {[type]} [description]
		 */
		dispatch: function(){
			return Dispatcher(this.http).run();
		},
		/**
		 * 获取controller
		 * @return {[type]} [description]
		 */
		getController: function(){
			var group = this.http.group;
			var controller = '';
			//检测controller名
			if (nameReg.test(this.http.controller)) {
				controller = A(group + "/" + this.http.controller, this.http);
				if (controller) {
					return controller;
				}
			}
			//controller不存在时调用的魔术方法
			var controllerConf = C('call_controller');
			if (controllerConf) {
				if (isString(controllerConf)) {
					controllerConf = controllerConf.split(":");
				}
				var action = Dispatcher.getAction(controllerConf.pop());
				controller = Dispatcher.getController(controllerConf.pop());
				group = Dispatcher.getGroup(controllerConf.pop());
				controller = A(group + "/" + controller, this.http);
				if (controller && isFunction(controller[action + C('action_suffix')])) {
					this.http.group = group;
					this.http.controller = controller;
					this.http.action = action;
					return controller;
				}
			}
		},
		/**
		 * 执行
		 * @return {[type]} [description]
		 */
		exec: function(){
			var controller = this.getController();
			if (!controller) {
				return getPromise(new Error("Controller `" + this.http.controller + "` not found. " + this.http.pathname), true);
			}
			var self = this;
			var action = this.http.action;
			var act = action;
			//添加action后缀
			action += C('action_suffix') || "";
			//检测action名
			if (!nameReg.test(action)) {
				return getPromise(new Error('action `' + act + '` is not valid. ' + this.http.pathname), true);
			}
			var initReturnPromise = getPromise(controller.__initReturn);
			//对应的action方法存在
			if (isFunction(controller[action])) {
				//方法参数自动绑定，直接从形参里拿到对应的值
				if (C('url_params_bind')) {
					var toString = controller[action].toString().replace(commentReg, '');
					var match = toString.match(parsReg)[1].split(/,/).filter(function(item){
						return item;
					});
					//匹配到形参
					if (match && match.length) {
						return initReturnPromise.then(function(){
							var data = match.map(function(item){
								return self.http.post[item] || self.http.get[item] || "";
							});
							return self.execAction(controller, action, act, data);
						});
					}
				}
				return initReturnPromise.then(function(){
					return self.execAction(controller, action, act);
				});
			}else{
				//当指定的方法不存在时，调用魔术方法
				//默认为__call方法
				var callMethod = C('call_method');
				if (callMethod && isFunction(controller[callMethod])) {
					return initReturnPromise.then(function(){
						return controller[callMethod](act, action);
					});
				}
			}
			return getPromise(new Error("action `" + action + "` not found. " + self.http.pathname), true);
		},
		/**
		 * 执行一个action, 支持before和after的统一操作
		 * 不对每个action都增加一个before和after，而是使用统一的策略
		 * 默认before和after调用名__before和__after
		 * @param  {[type]} controller [description]
		 * @param  {[type]} action     [description]
		 * @param  {[type]} act  [description]
		 * @param  {[type]} data       [description]
		 * @return {[type]}            [description]
		 */
		execAction: function(controller, action, act, data){
			var promise = getPromise();
			//before action
			var before = C('before_action_name');
			if (before && isFunction(controller[before])) {
				promise = getPromise(controller[before](act, action));
			}
			return promise.then(function(){
				if (data) {
					return controller[action].apply(controller, data)
				}else{
					return controller[action]()
				}
			}).then(function(){
				//after action
				var after = C('after_action_name');
				if (after && isFunction(controller[after])) {
					return controller[after](act, action);
				}
			});
		},
		/**
		 * 发送错误信息
		 * @param  {[type]} error [description]
		 * @return {[type]}       [description]
		 */
		sendError: function(error){
			var message = isError(error) ? error.stack : error;
			var http = this.http;
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
				readStream.on("end", function(){
					http.res.end();
				});
			}
		}
	};
});

/**
 * run
 * @return {[type]} [description]
 */
App.run = function(){
	"use strict";
	if (APP_MODE && App.mode[APP_MODE]) {
		return App.mode[APP_MODE]();
	}
	return App.mode._default();
};
/**
 * 不同模式下的run
 * @type {Object}
 */
App.mode = {
	//命令行模式
	cli: function(){
		"use strict";
		var defaultHttp = thinkHttp.getDefaultHttp(APP_MODE_DATA);
		thinkHttp(defaultHttp.req, defaultHttp.res).run(App.listener);
	},
	//默认模式
	_default: function(){
		"use strict";
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
	"use strict";
	//自定义创建server
	var createServerFn = C('create_server_fn');
	if (createServerFn) {
		if (isFunction(createServerFn)) {
			return createServerFn(App);
		}else if (isFunction(global[createServerFn])) {
			return global[createServerFn](App);
		}
	}
	var server = require("http").createServer(function (req, res) {
		thinkHttp(req, res).run(App.listener);
	});
	thinkRequire("WebSocket")(server, App).run();
	server.listen(C('port'));
}
/**
 * 监听回调函数
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
App.listener = function(http){
	"use strict";
	//自动发送thinkjs和版本的header
	http.setHeader("X-Powered-By", "thinkjs-" + THINK_VERSION);
	//禁止远程直接用带端口的访问,websocket下允许
	if (C('use_proxy') && http.host !== http.hostname && !http.websocket) {
		http.res.statusCode = 403;
		http.res.end();
		return getDefer().promise;
	}
	var instance = App(http);
	var domainInstance = domain.create();
	var deferred = getDefer();
	domainInstance.on("error", function(err){
		instance.sendError(err);
		deferred.reject(err);
	});
	domainInstance.run(function(){
		return tag('app_init', http).then(function(){
			return instance.dispatch();
		}).then(function(){
			return tag('app_begin', http);
		}).then(function(){
			return tag('action_init', http);
		}).then(function(){
			return instance.exec();
		}).then(function(){
			return tag('app_end', http);
		}).catch(function(err){
			instance.sendError(err);
		}).then(function(){
			deferred.resolve();
		})
	});
	return deferred.promise;
};