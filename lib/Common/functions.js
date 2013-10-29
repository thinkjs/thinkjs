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
 * 创建一个行为类
 */
global.Behavior = function(obj){
    var cls = Class({});
    cls.inherits(think_require("Behavior"));
    cls.extend(obj);
    return cls;
}
/**
 * 调用一个指定的行为
 * @param {[type]} name [description]
 */
global.B = function(name){
    var cls = name + "Behavior";
    if (APP_DEBUG) {
        G('behavior_start');
    };
    var result = think_require(cls)().run();
    if (APP_DEBUG) {
        G('behavior_end');
    };
    return result;
}

/**
 * 处理标签扩展
 * @return {[type]} [description]
 */
global.tag = function(name){
    var sys_tags = C('sys_tags.' + name);
    var tags = C('tags.' + name);
    global.__behavior_value = undefined;
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
            var result = B(b);
            if (result !== undefined) {
                __behavior_value = result;
            };
        })
    };
    return __behavior_value;
}
/**
 * 记录时间和内存使用情况
 */
global.G = function(){
    
}

/**
 * 创建一个Action,继承Action基类
 * @param {[type]} obj [description]
 */
global.Action = function(obj){
    var cls = Class({});
    cls.inherits(think_require("Action"));
    cls.extend(obj);
    return cls;
}
/**
 * 实例化Action类
 * A('Group/Action')
 * @param {[type]} name [description]
 */
global.A = function(name){
    try{
        return think_require(name + "Action")();
    }catch(e){
        return false;
    }
}