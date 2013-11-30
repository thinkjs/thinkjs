var fs = require("fs");
var path = require("path");
var os = require("os");
//EventEmitter
var EventEmitterInstance = new (require('events').EventEmitter);


/**
 * 自定义的require, 加入别名功能
 * @type {[type]}
 */
var _alias = {};
var _autoload_callbacks = [];
global.think_require = function(name){
    if (_alias[name]) {
        var obj = require(_alias[name]);
        if (typeof obj == 'function') {
            //修正子类继承的方法获取到正确的文件名
            obj.prototype.__filename = _alias[name];
        };
        return obj;
    };
    var result = '';
    _autoload_callbacks.some(function(callback){
        result = callback && callback(name);
        if (result) {
            return true;
        };
    })
    if (result) {
        var obj = require(result);
        if (typeof obj == 'function') {
            //修正子类继承的方法获取到正确的文件名
            obj.prototype.__filename = result;
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
global.register_autoload = function(callback){
    _autoload_callbacks.push(callback);
}
/**
 * 别名
 * @return {[type]} [description]
 */
global.alias_import = function(alias, classFile){
    if (is_string(alias)) {
        return _alias[alias] = classFile;
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
    cls.inherits(think_require(className));
    cls.extend(obj);
    return cls;
};

["Cache", "Behavior", "Controller", "Session", "Model", "Db"].forEach(function(item){
    global[item] = function(obj){
        return inherits(item, obj);
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
    var result = think_require(cls)(http).run(data);
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
        tags.forEach(function(b){
            var result = B(b, http, http.tag_data);
            if (result !== undefined) {
                http.tag_data = result;
            };
        })
    };
    return http.tag_data;
}
/**
 * 配置读取和写入
 */
var _config = {};
global.C = function(name, value){
    if (name === undefined) {
        return _config;
    };
    if (is_string(name)) {
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
    var instance = think_require(gm + "Controller")(http);
    if (action) {
        action += C('action_suffix');
        return instance[action].apply(instance, data || []);
    };
    return instance;
}

/**
 * 快速文件读取和写入
 */
var _cache = {};
global.F = function(name, value, rootPath){
    if (rootPath === undefined) {
        rootPath = DATA_PATH;
    };
    var filename = rootPath + "/" + name + ".json";
    if (value !== undefined) {
        if (value === null) {
            if (is_file(filename)) {
                fs.unlink(filename, function(){});
            };
            return;
        };
        var dir = path.dirname(filename);
        mkdir(dir, "0777");
        _cache[name] = value;
        fs.writeFile(filename, JSON.stringify(value), function(){});
        return;
    };
    if (_cache[name] !== undefined) {
        return _cache[name];
    };
    if (is_file(filename)) {
        var data = JSON.parse(file_get_contents(filename));
        _cache[name] = data;
        return data;
    };
    return false;
}
/**
 * 实例化模型
 */
global.M = global.D = function(name, tablePrefix, connection){
    if (name === undefined) {
        return think_require("Model")();
    };
    name = name.split(":");
    try{
        return think_require(name[0] + "Model")(name[1], tablePrefix, connection);
    }catch(e){
        return think_require("Model")(name[0], tablePrefix, connection);
    }
}
/**
 * 缓存的设置和读取
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
    var instance = think_require(type)(options);
    //获取缓存
    if (value === undefined) {
        return instance.get(name);
    };
    //移除缓存
    if (value === null) {
        return instance.rm(name);
    };
    var expire = is_number(options) ? options : undefined;
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
global.L = function(){
    
}