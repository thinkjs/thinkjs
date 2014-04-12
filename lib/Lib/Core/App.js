/**
 * 应用程序
 * @type {Object}
 */
var cluster = require("cluster");
var fs = require("fs");
var domain = require("domain");
var thinkHttp = thinkRequire("Http");
var Dispatcher = thinkRequire('Dispatcher');


var App = module.exports = Class(function(){
	"use strict";
	//controller和action的校验正则
	var nameReg = /^[A-Za-z](\w)*$/;
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
		 * 执行
		 * @return {[type]} [description]
		 */
		exec: function(){
			var group = this.http.group;
			var controller = '';
			var self = this;
			//检测controller名
			if (!nameReg.test(this.http.controller)) {
				controller = '';
			}else{
				controller = A(group + "/" + this.http.controller, this.http);
			}
			if (!controller) {
				var event = C('empty_controller_event');
				if (event && E(event, true).length > 0) {
					E(event, this.http.controller, group, this.http);
					return true;
				}
				return getPromise(this.http.controller + " controller not found", true);
			}
			var action = this.http.action;
			var oldAction = action;
			//添加action后缀
			action += C('action_suffix') || "";
			//检测action名
			if (!nameReg.test(action)) {
				return getPromise('action name error', true);
			}
			var initReturnPromise = getPromise(controller.__initReturn);
			//对应的action方法存在
			if (typeof controller[action] === 'function') {
				//方法参数自动绑定，直接从形参里拿到对应的值
				if (C('url_params_bind')) {
					var toString = controller[action].toString();
					toString = toString.replace(commentReg, '');
					var match = toString.match(parsReg)[1].split(/,/).filter(function(item){
						return item;
					});
					//匹配到形参
					if (match && match.length) {
						var data = [];
						match.forEach(function(item){
							var value = self.http.post[item] || self.http.get[item] || "";
							data.push(value);
						});
						return initReturnPromise.then(function(){
							return self.execAction(controller, action, oldAction, data);
						});
					}
				}
				return initReturnPromise.then(function(){
					return self.execAction(controller, action, oldAction);
				});
			}else{
				//当指定的方法不存在时，调用魔术方法
				//默认为__call方法
				var callMethod = C('call_method');
				if (callMethod && typeof controller[callMethod] === 'function') {
					return initReturnPromise.then(function(){
						return controller[callMethod](action);  
					});
				}
			}
			return getPromise("action: " + action + " not found", true);
		},
		/**
		 * 执行一个action, 支持before和after的统一操作
		 * 不对每个action都增加一个before和after，而是使用统一的策略
		 * 默认before和after调用名__before和__after
		 * @param  {[type]} controller [description]
		 * @param  {[type]} action     [description]
		 * @param  {[type]} oldAction  [description]
		 * @param  {[type]} data       [description]
		 * @return {[type]}            [description]
		 */
		execAction: function(controller, action, oldAction, data){
			var promise = getPromise();
			//before action
			var before = C('before_action_name');
			if (before && typeof controller[before] === 'function') {
				promise = getPromise(controller[before](oldAction, action));
			}
			return promise.then(function(){
				var ret = data ? controller[action].apply(controller, data) : controller[action]();
				return getPromise(ret);
			}).then(function(){
				//after action
				var after = C('after_action_name');
				if (after && typeof controller[after] === 'function') {
					return controller[after](oldAction, action);
				}
			});
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
		if (clusterNums === false) {
			return App.createServer();
		}
		if (clusterNums === 0 || clusterNums === true) {
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
	var server = require("http").createServer(function (req, res) {
		thinkHttp(req, res).run(App.listener);
	});
	var params = [C('port')];
	//禁止外网直接通过IP访问
	if (C('deny_remote_access_by_ip')) {
		params.push("127.0.0.1");
	}
	App.webSocket(server);
	server.listen.apply(server, params);
};
/**
 * webSocket
 * @param  {[type]} server [description]
 * @return {[type]}        [description]
 */
App.webSocket = function(server){
	"use strict";
	if (!C('use_websocket')) {
		return;
	}
	var WebSocket = require('faye-websocket');
	server.on("upgrade", function(request, socket, body){
		if (!WebSocket.isWebSocket(request)) {
			return;
		}
		var ws = new WebSocket(request, socket, body);
		var httpInstance;
		ws.on('message', function(event) {
			var urlInfo = require("url").parse(event.target.url, true, true);
			var data = JSON.parse(event.data || "{}");
			data = extend(data, {
				host: urlInfo.hostname,
				write: function(data){
					return ws && ws.send(JSON.stringify(data));
				},
				end: function(){
					if (ws) {
						ws.close();
						ws = null;
					}
				}
			});
			var defaultHttp = thinkHttp.getDefaultHttp(data);
			httpInstance = thinkHttp(defaultHttp.req, defaultHttp.res);
			httpInstance.run(App.listener);
		});
		//websocket关闭
		ws.on('close', function(){
			if (httpInstance && httpInstance.http && httpInstance.http.emit) {
				httpInstance.http.emit("websocket.close");
			}
			ws = null;
		});
	});
};
/**
 * 监听回调函数
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
App.listener = function(http){
	"use strict";
	//自动发送thinkjs和版本的header
	http.setHeader("X-Powered-By", "thinkjs-" + THINK_VERSION);
	//禁止远程直接用带端口的访问，一般都是通过webserver做一层代理
	if (C('deny_remote_access_with_port') && http.host !== http.hostname) {
		http.res.statusCode = 403;
		http.res.end();
		return;
	}
	var domainInstance = domain.create();
	domainInstance.on("error", function(err){
		App.sendError(err, http);
	});
	domainInstance.run(function(){
		var instance = App(http);
		return tag ('app_init', http).then(function(){
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
			App.sendError(err, http);
		});
	});
};
/**
 * 发送错误
 * @param  {[type]} error [description]
 * @param  {[type]} http  [description]
 * @return {[type]}       [description]
 */
App.sendError = function(error, http){
	"use strict";
	var message = isError(error) ? error.stack : error;
	console.log(message);
	if (!http.res) {
		return;
	}
	if (APP_DEBUG) {
		http.res.end(message);
	}else{
		http.setHeader('Content-Type', 'text/html; charset=' + C('encoding'));
		var readStream = fs.createReadStream(C('error_tpl_path'));
		readStream.pipe(http.res);
		readStream.on("end", function(){
			http.res.end();
		});
	}
};