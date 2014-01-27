var fs = require("fs");
var path = require("path");
var os = require("os");
//EventEmitter
var EventEmitterInstance = new (require('events').EventEmitter)();


var _alias = {};
var _autoload_callbacks = [];
/**
 * thinkRequire获取到的路径
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
global.thinkRequirePath = function(name){
	if (_alias[name]) {
		return _alias[name];
	};
	var result = '';
	_autoload_callbacks.some(function(callback){
		result = callback && callback(name);
		if (result) {
			return true;
		};
	});
	return result;
}
/**
 * 自定义的require, 加入别名功能
 * @type {[type]}
 */
global.thinkRequire = function(name){
	var path = thinkRequirePath(name);
	if (path) {
		var obj = require(path);
		if (typeof obj === 'function') {
			//修正子类继承的方法获取到正确的文件名
			obj.prototype.__filename = path;
		};
		return obj;
	};
	return require(name);
}
/**
 * 注册require
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
global.registerAutoload = function(callback){
	_autoload_callbacks.push(callback);
}
/**
 * 别名
 * @return {[type]} [description]
 */
global.aliasImport = function(alias, classFile){
	if (isString(alias)) {
		return (_alias[alias] = classFile);
	};
	_alias = extend(_alias, alias);
}
/**
 * 类继承
 * @param  {[type]} className [description]
 * @param  {[type]} obj       [description]
 * @return {[type]}           [description]
 */
global.inherits = function(className, obj){
	var cls = Class({});
	cls.inherits(thinkRequire(className));
	cls.extend(obj);
	return cls;
};

//常用类的基类
["Cache", "Behavior", "Controller", "Session", "Model", "Db"].forEach(function(item){
	global[item] = function(super_, obj){
		if (isString(super_)) {
			return inherits(super_, obj);
		}
		return inherits(item, super_);
	}
});


/**
 * 调用一个指定的行为
 * @param {[type]} name [description]
 */
global.B = function(name, http, data){
	var cls = name + "Behavior";
	if (APP_DEBUG) {
		G('behavior_start');
	};
	var result = thinkRequire(cls)(http).run(data);
	if (APP_DEBUG) {
		G('behavior_end');
	};
	return result;
}

/**
 * 处理标签扩展
 * @return {[type]} [description]
 */
global.tag = function(name, http, data){
	var sys_tags = C('sys_tag.' + name) || [];
	var tags = C('tag.' + name) || [];
	//tag处理的数据
	http.tag_data = data;
	if (tags.length) {
		var override = false;
		if (typeof tags[0] == 'boolean') {
			override = tags[0];
			tags.shift();
		};
		if (!override && sys_tags.length) {
			tags = sys_tags.concat(tags);
		};
	}else{
		tags = sys_tags;
	}
	if (tags.length) {
		if (APP_DEBUG) {
			G(name + '_start');
		};
		tags = tags.slice();
		function runBehavior(){
			var behavior = tags.shift();
			if (behavior) {
				var result = B(behavior, http, http.tag_data);
				if (isPromise(result)) {
					return result.then(function(data){
						if (data !== undefined) {
							http.tag_data = data;
						};
						return runBehavior();
					})
				}else{
					if (result !== undefined) {
						http.tag_data = result;
					};
					return runBehavior();
				}
			}
			return http.tag_data;
		}
		return getPromise(runBehavior());
	};
	return getPromise(http.tag_data);
}
/**
 * 配置读取和写入
 */
var _config = {};
global.C = function(name, value){
	if (name === undefined) {
		return _config;
	};
	if (isString(name)) {
		if (name.indexOf('.') <= 0) {
			name = name.toLowerCase();
			if (value === undefined) {
				return _config[name];
			};
			_config[name] = value;
			return;
		};
		name = name.split(".");
		name[0] = name[0].toLowerCase();
		if (value === undefined) {
			value = _config[name[0]] || {};
			return value[name[1]];
		};
		if (!_config[name[0]]) {
			_config[name[0]] = {};
		};
		_config[name[0]][name[1]] = value;
	}else{
		_config = extend(_config, name);
	}
}
/**
 * 记录时间和内存使用情况
 */
global.G = function(){
	return {
		time: Date.now(),
		memory: os.totalmem() - os.freemem()
	}
}
/**
 * 实例化Controller类，可以调用一个具体的Action
 * A('Home/Index'), A('Admin/Index/test')
 * @param {[type]} name [description]
 */
global.A = function(name, http, data){
	if (name.indexOf('/') === -1) {
		name = http.req.group + "/" + name;
	};
	name = name.split("/");
	var gm = name.shift() + "/" + name.shift();
	var action = name.shift();
	var path = thinkRequirePath(gm + "Controller");
	if (path) {
		var instance = thinkRequire(gm + "Controller")(http);
		if (action) {
			action += C('action_suffix');
			return instance[action].apply(instance, data || []);
		};
		return instance;
	};
	return null;
}

/**
 * 快速文件读取和写入
 * 默认写入到App/Runtime/Data目录下
 */
global.F = function(name, value, rootPath){
	if (rootPath === undefined) {
		rootPath = DATA_PATH;
	};
	var filePath = rootPath + "/" + name + ".json";
	if (value !== undefined) {
		mkdir(path.dirname(filePath));
		fs.writeFile(filePath, JSON.stringify(value), function(){
			chmod(filePath);
		});
		return;
	};
	if (isFile(filePath)) {
		return JSON.parse(getFileContent(filePath));
	};
	return false;
}
/**
 * 实例化模型
 */
global.M = global.D = function(name, tablePrefix, connection){
	if (name === undefined) {
		return thinkRequire("Model")();
	};
	name = name.split(":");
	var path = thinkRequirePath(name[0] + "Model");
	if (path) {
		return thinkRequire(name[0] + "Model")(name[1], tablePrefix, connection);
	}else{
		return thinkRequire("Model")(name[0], tablePrefix, connection);
	}
}
/**
 * 缓存的设置和读取
 * 获取返回的是一个promise
 */
global.S = function(name, value, options){
	if (options === undefined) {
		options = {};
	}else if (options === true) {
		options = {type: true};
	};
	var type = options.type || C('data_cache_type');
	if (type && type !== true) {
		type = ucfirst(type.toLowerCase()) + "Cache";
	}else{
		type = "Cache";
	}
	var instance = thinkRequire(type)(options);
	//获取缓存
	if (value === undefined) {
		return instance.get(name);
	};
	//移除缓存
	if (value === null) {
		return instance.rm(name);
	};
	var expire = isNumber(options) ? options : undefined;
	return instance.set(name, value, expire);
}
/**
 * 自定义事件
 * @param {[type]}   name     [description]
 * @param {Function} callback [description]
 */
global.E = function(event, callback, remove){
	var instance = EventEmitterInstance;
	if (remove === true) {
		return instance.removeListener(event, callback);
	};
	if (typeof callback == 'function') {
		return instance.on(event, callback);
	};
	if (event === null) {
		return instance.removeAllListeners();
	};
	if (callback === null) {
		return instance.removeAllListeners(event);
	};
	if (callback === true) {
		return instance.listeners(event);
	};
	var args = [].slice.call(arguments, 1);
	args.unshift(event);
	return instance.emit.apply(instance, args);
}

/**
 * 计数
 */
global.N = function(){
	
}
global.L = function(name){
	return name;
}