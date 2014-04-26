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
var getThinkRequirePath = function(name){
	"use strict";
	if (_alias[name]) {
		return _alias[name];
	}
	var result = "";
	_autoload_callbacks.some(function(callback){
		result = callback && callback(name);
		if (result) {
			return true;
		}
	});
	return result;
};
/**
 * 自定义的require, 加入别名功能
 * @type {[type]}
 */
global.thinkRequire = function(name){
	"use strict";
	var path = getThinkRequirePath(name);
	if (path) {
		var obj = require(path);
		if (typeof obj === 'function') {
			//修正子类继承的方法获取到正确的文件名
			obj.prototype.__filename = path;
		}
		return obj;
	}
	return require(name);
};
/**
 * 注册require
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
global.registerAutoload = function(callback){
	"use strict";
	_autoload_callbacks.push(callback);
};
/**
 * 别名
 * @return {[type]} [description]
 */
global.aliasImport = function(alias, classFile){
	"use strict";
	if (isString(alias)) {
		_alias[alias] = classFile;
	}else{
		_alias = extend(_alias, alias);
	}
};
/**
 * 类继承
 * @param  {[type]} className [description]
 * @param  {[type]} obj       [description]
 * @return {[type]}           [description]
 */
global.inherits = function(className, obj){
	"use strict";
	var cls = Class({});
	cls.inherits(thinkRequire(className));
	cls.extend(obj);
	return cls;
};

//常用类的基类
["Cache", "Behavior", "Controller", "Session", "Model", "Db"].forEach(function(item){
	"use strict";
	global[item] = function(super_, obj){
		if (isString(super_)) {
			return inherits(super_, obj);
		}
		return inherits(item, super_);
	};
});


/**
 * 调用一个指定的行为
 * @param {[type]} name [description]
 */
global.B = function(name, http, data){
	"use strict";
	if (typeof name === 'function') {
		return name(http, data);
	}
	return thinkRequire(name + "Behavior")(http).run(data);
};

/**
 * 处理标签扩展
 * @return {[type]} [description]
 */
global.tag = function(name, http, data){
	"use strict";
	var sys_tags = C('sys_tag.' + name) || [];
	var tags = C('tag.' + name) || [];
	//tag处理的数据
	http.tag_data = data;
	if (tags.length) {
		var override = false;
		if (typeof tags[0] === 'boolean') {
			override = tags[0];
			tags.shift();
		}
		if (!override && sys_tags.length) {
			tags = sys_tags.concat(tags);
		}
	}else{
		tags = sys_tags;
	}
	tags = tags.slice();
	function runBehavior(){
		var behavior = tags.shift();
		if (!behavior) {
			return http.tag_data;
		}
		var result = B(behavior, http, http.tag_data);
		return getPromise(result).then(function(data){
			if (data !== undefined) {
				http.tag_data = data;
			}
			return runBehavior();
		})
	}
	return getPromise(tags.length ? runBehavior() : http.tag_data);
};
/**
 * 配置读取和写入
 */
//var _config = {};
global.C = function(name, value){
	"use strict";
	if (name === undefined) {
		var result = {};
		for(name in C){
			result[name] = C[name];
		}
		return result;
	}
	if (isString(name)) {
		if (name.indexOf('.') === -1) {
			if (value === undefined) {
				return C[name];
			}
			C[name] = value;
			return;
		}
		name = name.split(".");
		if (value === undefined) {
			value = C[name[0]] || {};
			return value[name[1]];
		}
		if (!C[name[0]]) {
			C[name[0]] = {};
		}
		C[name[0]][name[1]] = value;
	}else{
		C = extend(C, name);
	}
};
/**
 * 记录时间和内存使用情况
 */
global.G = function(){
	"use strict";
	return {
		time: Date.now(),
		memory: os.totalmem() - os.freemem()
	};
};
/**
 * 实例化Controller类，可以调用一个具体的Action
 * A('Home/Index'), A('Admin/Index/test')
 * @param {[type]} name [description]
 */
global.A = function(name, http, data){
	"use strict";
	if (name.indexOf('/') === -1) {
		name = http.req.group + "/" + name;
	}
	name = name.split("/");
	var gm = name.shift() + "/" + name.shift();
	var action = name.shift();
	var path = getThinkRequirePath(gm + "Controller");
	if (path) {
		var instance = thinkRequire(gm + "Controller")(http);
		if (action) {
			action += C('action_suffix');
			return instance[action].apply(instance, data || []);
		}
		return instance;
	}
	return null;
};

/**
 * 快速文件读取和写入
 * 默认写入到App/Runtime/Data目录下
 */
global.F = function(name, value, rootPath){
	"use strict";
	if (rootPath === undefined) {
		rootPath = DATA_PATH;
	}
	var filePath = rootPath + "/" + name + ".json";
	if (value !== undefined) {
		mkdir(path.dirname(filePath));
		fs.writeFile(filePath, JSON.stringify(value), function(){
			chmod(filePath);
		});
		return;
	}
	if (isFile(filePath)) {
		return JSON.parse(getFileContent(filePath));
	}
	return false;
};
/**
 * 实例化模型
 */
global.M = global.D = function(name, tablePrefix, connection){
	"use strict";
	if (name === undefined) {
		return thinkRequire("Model")();
	}
	name = name.split(":");
	var path = getThinkRequirePath(name[0] + "Model");
	if (path) {
		return thinkRequire(name[0] + "Model")(name[1], tablePrefix, connection);
	}else{
		return thinkRequire("Model")(name[0], tablePrefix, connection);
	}
};
/**
 * 缓存的设置和读取
 * 获取返回的是一个promise
 */
global.S = function(name, value, options){
	"use strict";
	if (options && !isObject(options)) {
		options = {timeout: options};
	}
	options = options || {};
	var type = options.type === undefined ? C('cache_type') : options.type;
	var instance = thinkRequire(ucfirst(type.toLowerCase()) + "Cache")(options);
	//获取缓存
	if (value === undefined) {
		return instance.get(name);
	}
	//移除缓存
	if (value === null) {
		return instance.rm(name);
	}
	return instance.set(name, value, options.timeout);
};
/**
 * 自定义事件
 * @param {[type]}   name     [description]
 * @param {Function} callback [description]
 */
global.E = function(event, callback, remove){
	"use strict";
	var instance = EventEmitterInstance;
	if (remove === true) {
		return instance.removeListener(event, callback);
	}
	if (typeof callback === 'function') {
		return instance.on(event, callback);
	}
	if (event === null) {
		return instance.removeAllListeners();
	}
	if (callback === null) {
		return instance.removeAllListeners(event);
	}
	if (callback === true) {
		return instance.listeners(event);
	}
	var args = [].slice.call(arguments, 1);
	args.unshift(event);
	return instance.emit.apply(instance, args);
};
/**
 * 计数
 */
global.N = function(){
	"use strict";
};
global.L = function(name){
	"use strict";
	return name;
};