var fs = require("fs");
var path = require("path");
var util = require("util");
var crypto = require("crypto");

/**
 * 由于非常依赖promise，所以将promise设置为全局变量
 * @type {[type]}
 */
global.Promise = require('es6-promise').Promise;

/**
 * 动态创建一个类
 * 提供了继承、扩展、调用父级别方法等方法
 * @return {[type]} [description]
 */
global.Class = function (prop) {    
    var cls = function () {        
        function T(args) {
            if(typeof this.init == 'function'){
                this.__initReturn = this.init.apply(this, args);
            }            
            return this;   
        }        
        var _t = arguments.callee;
        T.prototype = _t.prototype;           
        T.constructor = _t;            
        return new T(arguments);     
    };        
    cls.extend = function(pro){
        extend(this.prototype, pro);
        return this;
    };
    cls.inherits = function(superCls){
        util.inherits(this, superCls);
        return this;
    }
    //调用父级方法
    cls.prototype.super_ = function(name, data){
        if (!this[name]) {
            return false;
        };
        if (!isArray(data)) {
            data = [data];
        };
        var super_ = this.constructor.super_;
        while(1){
            if (this[name] === super_.prototype[name] && super_.super_) {
                super_ = super_.super_;
            }else{
                break;
            }
        }
        var method = super_.prototype[name];
        delete super_.prototype[name];
        var ret =  method.apply(this, data);
        super_.prototype[name] = method;
        return ret;
    }
    if (typeof prop == 'function') {
        prop = prop();
    };
    prop = prop || {};
    for(var name in prop){
        cls.prototype[name] = prop[name];
    }
    return cls;
}
/**
 * extend, from jquery
 * @return {[type]} [description]
 */
global.extend = function(){
    var args = [].slice.call(arguments);
    var deep = true;
    var target = args.shift();
    if (isBoolean(target)) {
        deep = target;
        target = args.shift();
    };
    target = target || {};
    var length = args.length;
    var options, name, src, copy, copyAsArray, clone;
    for(var i = 0; i < length; i++){
        options = args[i];
        if (isFunction(options)) {
            options = options();
        };
        for(name in options){
            src = target[name];
            copy = options[name];
            if (src === copy) {
                continue;
            };
            if (deep && copy && (isObject(copy) || (copyAsArray = isArray(copy) ))) {
                if (copyAsArray) {
                    copyAsArray = false;
                    clone = src && isArray(src) ? src : [];
                }else{
                    clone = src && isObject(src) ? src : {}; 
                }
                target[name] = extend(deep, clone, copy);
            }else if (copy !== undefined) {
                target[name] = copy;
            };
        }
    }
    return target;
}

// global.extend = function(origin, add){
//     if (typeof add == 'function') {
//         add = add();
//     };
//     return util._extend(origin || {}, add);
// };

/**
 * 是否是boolean
 * @param  {[type]}  obj
 * @return {Boolean}
 */
global.isBoolean = function(obj){
    return obj === true || obj === false;
}
//Object上toString方法
var toString = Object.prototype.toString;
/**
 * 是否是数字
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isNumber = function(obj){
    return toString.call(obj) === '[object Number]';
}
/**
 * 是否是个对象
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isObject = function(obj){
    return toString.call(obj) === '[object Object]';
}
/**
 * 是否是字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isString = function(obj){
    return toString.call(obj) === '[object String]';
}
/**
 * 是否是个function
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isFunction = function(obj){
    return typeof obj === 'function';
}
/**
 * 是否是日期
 * @return {Boolean} [description]
 */
global.isDate = function(obj){
    return util.isDate(obj);
}
/**
 * 是否是正则
 * @param  {[type]}  reg [description]
 * @return {Boolean}     [description]
 */
global.isRegexp = function(obj){
    return util.isRegExp(obj);
}
/**
 * 是否是个错误
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isError = function(obj){
    return util.isError(obj);
}
/**
 * 判断对象是否为空
 * @param  {[type]}  obj
 * @return {Boolean}
 */
global.isEmpty = function(obj){
    if (isObject(obj)) {
        return Object.keys(obj).length === 0;
    }else if (isArray(obj)) {
        return obj.length === 0;
    }else if (isString(obj)) {
        return obj.length === 0;
    }else if (isNumber(obj)) {
        return obj === 0;
    }else if (obj === null || obj === undefined) {
        return true;
    }else if (isBoolean(obj)) {
        return !obj;
    };
    return false;
}
/**
 * 是否是个标量
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isScalar = function(obj){
    return isBoolean(obj) || isNumber(obj) || isString(obj);
}
/**
 * 是否是个数组
 * @type {Boolean}
 */
global.isArray = Array.isArray;
/**
 * 是否是个文件
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
global.isFile = function(p){
    if (!fs.existsSync(p)) {
        return false;
    };
    var stats = fs.statSync(p);
    return stats.isFile();
}
/**
 * 是否是个目录
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
global.isDir = function(p){
    if (!fs.existsSync(p)) {
        return false;
    };
    var stats = fs.statSync(p);
    return stats.isDirectory();
}
/**
 * 是否是个数字的字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isNumberString = function(obj){
    var parseValue = parseFloat(obj);
    if (isNaN(parseValue)) {
        return false;
    };
    return (parseValue + "").length == (obj + "").length
}
/**
 * 判断是否是个promise
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isPromise = function(obj){
    return obj && typeof obj.then === 'function';
}

/**
 * 判断一个文件或者目录是否可写
 * @param  {[type]}  p [description]
 * @return {Boolean}      [description]
 */
global.isWritable = function(p){
    if (!fs.existsSync(p)) {
        return false;
    };
    var stats = fs.statSync(p);
    var mode = stats.mode;
    var uid = process.getuid ? process.getuid() : 0;
    var gid = process.getgid ? process.getgid() : 0;
    var owner = uid == stats.uid;
    var group = gid == stats.gid;
    return owner && (mode & 00200) || // User is owner and owner can write.
            group && (mode & 00020) || // User is in group and group can write.
         (mode & 00002); // Anyone can write.
}

/**
 * 递归创建目录，同步模式
 * @param  {[type]} p    [description]
 * @param  {[type]} mode [description]
 * @return {[type]}      [description]
 */
global.mkdir = function(p, mode){
    mode = mode || 0777;
    if (fs.existsSync(p)) {
        return true;
    };
    var pp = path.dirname(p);
    if (fs.existsSync(pp)) {
        fs.mkdirSync(p, mode);
    }else{
        mkdir(pp, mode);
        mkdir(p, mode);
    }
    return true;
}
/**
 * 修改目录或者文件权限
 * @param  {[type]} p    [description]
 * @param  {[type]} mode [description]
 * @return {[type]}      [description]
 */
global.chmod = function(p, mode){
    mode = mode || 0777;
    if (fs.existsSync(p)) {
        return true;
    };
    return fs.chmodSync(p, mode);
}
/**
 * 获取文件内容
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
global.getFileContent = function(file){
    if (!fs.existsSync(file)) {
        return '';
    };
    var encoding = C("encoding") || "utf8";
    return fs.readFileSync(file, encoding);
}
/**
 * 设置文件内容
 * @param  {[type]} file [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
global.setFileContent = function(file, data){
    return fs.writeFileSync(file, data);
}
/**
 * 大写首字符
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
global.ucfirst = function(name){
    name = name || "";
    return name.substr(0,1).toUpperCase() + name.substr(1).toLowerCase();
}
/**
 * 获取字符串的md5
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
global.md5 = function(str){
    var instance = crypto.createHash('md5');
    instance.update(str);
    return instance.digest('hex');
}
/**
 * 字符串命名风格转换
 * @param  {[type]} name [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
global.parseName = function(name, type){
    name = (name + "").trim();
    if (type == 1) {
        name = name.replace(/_([a-zA-Z])/g, function(a, b){
            return b.toUpperCase();
        });
        return name.substr(0, 1).toUpperCase() + name.substr(1);
    } else {
        //首字母如果是大写，不转义为_x
        if (name.length >= 1) {
            name = name.substr(0, 1).toLowerCase() + name.substr(1);
        };
        return name.replace(/[A-Z]/g, function(a){
            return "_" + a;
        }).toLowerCase();
    }
}
/**
 * 生成一个promise,如果传入的参数是promise则直接返回
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
global.getPromise = function(obj, reject){
    if (isPromise(obj)) {
        return obj;
    };
    if (reject) {
        return Promise.reject(obj);
    };
    return Promise.resolve(obj);
}
/**
 * 生成一个defer对象
 * @return {[type]} [description]
 */
global.getDefer = function(){
    var deferred = {};
    deferred.promise = new Promise(function(resolve, reject){
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}