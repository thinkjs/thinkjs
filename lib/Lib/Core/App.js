/**
 * 应用程序
 * @type {Object}
 */
var cluster = require("cluster");
var fs = require("fs");
var thinkHttp = thinkRequire("Http");

var App = module.exports = Class(function(){
	//controller和action的校验正则
	var nameReg = /^[A-Za-z](\w)*$/;
	//注释的正则
	var commentReg = /((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg;
	//获取形参的正则
	var parsReg = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;

	return {
		http: null,
		init: function(http){
			this.http = http;
		},
		/**
		 * 解析路由
		 * @return {[type]} [description]
		 */
		dispatch: function(){
			return thinkRequire('Dispatcher')(this.http).run();
		},
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
				};
				return getPromise(this.http.controller + " controller not found", true);
			};
			var action = this.http.action;
			var oldAction = action;
			//添加action后缀
			action += C('action_suffix') || "";
			//检测action名
			if (!nameReg.test(action)) {
				return getPromise('action name error', true);
			};
			var initReturnPromise = getPromise(controller.__initReturn);
			//对应的action方法存在
			if (typeof controller[action] == 'function') {
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
						})
					}
				}
				return initReturnPromise.then(function(){
					return self.execAction(controller, action, oldAction);
				})
			}else{
				//当指定的方法不存在时，调用魔术方法
				//默认为__call方法
				if (C('call_method') && typeof controller[C('call_method')] == 'function') {
					return initReturnPromise.then(function(){
						return controller[C('call_method')](action);  
					});
				};
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
			var promise = null;
			//before action
			var before = C('before_action_name');
			if (before && typeof controller[before] == 'function') {
				var ret = controller[before].call(controller, oldAction, action);
				promise = getPromise(ret);
			}else{
				promise = getPromise();
			}
			return promise.then(function(){
				var ret = null;
				//绑定方法参数
				if (data) {
					ret = controller[action].apply(controller, data);
				}else{
					ret = controller[action]();
				}
				return getPromise(ret);
			}).then(function(){
				//after action
				var after = C('after_action_name');
				if (after && typeof controller[after] == 'function') {
					return controller[after].call(controller, oldAction, action);
				};
			});
		}
	}
});

/**
 * run
 * @return {[type]} [description]
 */
App.run = function(){
	if (APP_MODE && App.mode[APP_MODE]) {
		return App.mode[APP_MODE]();
	};
	return App.mode._default();
}
/**
 * 不同模式下的run
 * @type {Object}
 */
App.mode = {
	//命令行模式
	cli: function(){
		var defaultHttp = thinkHttp.getDefaultHttp(APP_MODE_DATA);
		thinkHttp(defaultHttp.req, defaultHttp.res).run(App.listener);
	},
	//默认模式
	_default: function(){
		var clusterNums = C('use_cluster');
		//不使用cluster
		if (clusterNums === false) {
			return App.createServer();
		}
		if (clusterNums === 0 || clusterNums === true) {
			clusterNums = require('os').cpus().length;
		};
		if (cluster.isMaster) {
			for (var i = 0; i < clusterNums; i++) {
				cluster.fork();
			}
			cluster.on('exit', function(worker, code, signal) {
				console.log('worker ' + worker.process.pid + ' died');
				process.nextTick(function(){
					cluster.fork();
				});
			});
		}else {
			App.createServer();
		}
	}
}
/**
 * 创建服务
 * @return {[type]} [description]
 */
App.createServer = function(){
	var server = require("http").createServer(function (req, res) {
		thinkHttp(req, res).run(App.listener);
	});
	var params = [C('port')];
	//禁止外网直接通过IP访问
	if (C('deny_remote_access_by_ip')) {
		params.push("127.0.0.1");
	};
	App.webSocket(server);
	server.listen.apply(server, params);
};
/**
 * webSocket
 * @param  {[type]} server [description]
 * @return {[type]}        [description]
 */
App.webSocket = function(server){
	if (C('use_websocket')) {
		//暂时使用该库
		var WebSocket = require('faye-websocket');
		server.on("upgrade", function(request, socket, body){
			if (WebSocket.isWebSocket(request)) {
				var ws = new WebSocket(request, socket, body);
				ws.on('message', function(event) {
					var urlInfo = require("url").parse(event.target.url, true, true);
					var data = JSON.parse(event.data || "{}");
					var defaultHttp = thinkHttp.getDefaultHttp(extend(data, {
						host: urlInfo.hostname,
						write: function(data){
							ws.send(JSON.stringify(data));
						},
						end: function(){
							ws.close();
						}
					}));
					thinkHttp(defaultHttp.req, defaultHttp.res).run(App.listener)
				});
				ws.on('close', function(event) {
					console.log('close', event.code, event.reason);
					ws = null;
				});
			}
		})
	};
}
/**
 * 监听回调函数
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
App.listener = function(http){
	//自动发送thinkjs和版本的header
	http.setHeader("X-Powered-By", "thinkjs-" + THINK_VERSION);
	//初始化Session
	if (C('session_auto_start')) {
		thinkRequire('Session').start(http);
	};
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
		console.log(isError(err) ? err.stack : err);
		if (http.res) {
			http.setHeader('Content-Type', 'text/html; charset=' + C('encoding'));
			var readStream = fs.createReadStream(C('error_tpl_path'));
			readStream.pipe(http.res);
			readStream.on("end", function(){
				http.res.end();
			})
		};
	});
}