/**
 * 自定义的require, 加入别名功能
 * @type {[type]}
 */
var _alias = {};
var _autoload_callbacks = [];
global.think_require = function(name){
    if (_alias[name]) {
        return require(_alias[name]);
    };
    var result = '';
    _autoload_callbacks.some(function(callback){
        var file = callback && callback(name);
        if (file) {
            result = file;
            return true;
        };
        return false;
    })
    if (result) {
        return require(result);
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

["Cache", "Behavior", "Action", "Session"].forEach(function(item){
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
    var sys_tags = C('sys_tags.' + name);
    var tags = C('tags.' + name);
    global.__behavior_data = data;
    if (tags) {
        var override = false;
        if (typeof tags[0] == 'boolean') {
            override = tags[0];
            tags.shift();
        };
        if (!override && sys_tags) {
            tags = tags.push.apply(tags, sys_tags);
        };
    }else{
        tags = sys_tags;
    }
    if (tags) {
        if (APP_DEBUG) {
            G(name + '_start');
        };
        tags.forEach(function(b){
            var result = B(b, http, __behavior_data);
            if (result !== undefined) {
                __behavior_data = result;
            };
        })
    };
    return __behavior_data;
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
    
}
/**
 * 实例化Action类
 * A('Group/Action')
 * @param {[type]} name [description]
 */
global.A = function(name, http){
    if (name.indexOf('/') === -1) {
        var module = http.req.module;
        name = module + "/" + name;
    };
    try{
        return think_require(name + "Action")(http);
    }catch(e){
        return false;
    }
}
/**
 * 快速文件读取和写入
 */
global.F = function(){

}
global.M = function(){

}
global.D = function(){

}
/**
 * 缓存
 */
var caches = {};
global.S = function(name, value, options){
    if (options === undefined) {
        options = {};
    };
    var type = options.type || C('data_cache_type');
    if (type) {
        type = ucfirst(type.toLowerCase()) + "Cache";
    }else{
        type = "Cache";
    }
    var instance = caches[type];
    if (!instance) {
        instance = caches[type] = think_require(type)(options);
    };
    if (value === undefined) {
        return instance.get(name);
    };
    if (value === null) {
        return instance.rm(name);
    };
    var expire = typeof options == 'number' ? options : undefined;
    return instance.set(name, value, expire);
}
global.N = function(){
    
}