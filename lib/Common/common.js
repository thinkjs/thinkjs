var fs = require("fs");
var path = require("path");
var util = require("util");
/**
 * 动态创建一个类
 * @return {[type]} [description]
 */
global.Class = function (prop) {    
    var cls = function () {        
        function T(args) {            
            this.init && this.init.apply(this, args);
            return this;   
        }        
        var _t = arguments.callee;
        T.prototype = _t.prototype;           
        T.constructor = _t;            
        return new T(arguments);     
    };        
    cls.extend = function(pro){
        global.extend(this.prototype, pro);
        return this;
    };
    cls.inherits = function(superCls){
        util.inherits(this, superCls);
        return this;
    }
    //调用父级方法
    cls.prototype.super = function(name, data){
       var method = this.constructor.super_.prototype[name];
       if (!is_array(data)) {
            data = [data];
       };
       method.apply(this, data);
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
 * extend
 * from jquery
 * @return {[type]} [description]
 */
global.extend = function(origin, add){
    if (typeof add == 'function') {
        add = add();
    };
    return util._extend(origin, add);
};
global.is_object = function(obj){
    return Object.prototype.toString.call(obj) == '[object Object]';
}
global.is_string = function(obj){
    return Object.prototype.toString.call(obj) == '[object String]';
}
global.is_array = function(obj){
    return Array.isArray(obj);
}
global.is_file = function(p){
    if (!fs.existsSync(p)) {
        return false;
    };
    var stats = fs.statSync(p);
    return stats.isFile();
}
global.is_dir = function(p){
    if (!fs.existsSync(p)) {
        return false;
    };
    var stats = fs.statSync(p);
    return stats.isDirectory();
}
global.is_number = function(obj){
    obj = obj + "";
    return ((parseFloat(obj, 10) || "")+"").length == obj.length;
}
global.is_empty = function(obj){
    var type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    switch(type){
        case 'boolean':
            return obj;
        case 'number':
            return obj != 0;
        case 'string':
            return obj.length != 0;
        case 'array':
            return obj.length == 0;
        case 'regexp':
            return false;
        default:
            return Object.keys(obj).length == 0;
    }
    return false;
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
        global.mkdir(pp, mode);
        global.mkdir(p, mode);
    }
    return true;
}
/**
 * 判断一个目录是否可写
 * @param  {[type]}  p [description]
 * @return {Boolean}      [description]
 */
global.is_writable = function(p){
    if (!fs.existsSync(p)) {
        return false;
    };
    var stats = fs.statSync(p);
    var mode = stats.mode;
    var uid = process.getuid();
    var gid = process.getgid();
    var owner = uid == stats.uid;
    var group = gid == stats.gid;
    return owner && (mode & 00200) || // User is owner and owner can write.
            group && (mode & 00020) || // User is in group and group can write.
         (mode & 00002); // Anyone can write.
}
/**
 * 获取文件内容
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
global.file_get_contents = function(file){
    if (!fs.existsSync(file)) {
        return '';
    };
    var encoding = C("encoding") || "utf8";
    return fs.readFileSync(file, encoding);
}

global.ucfirst = function(name){
    name = name || "";
    return name.substr(0,1).toUpperCase() + name.substr(1).toLowerCase();
}
/**
 * 抛出一个错误
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
global.throw_error = function(obj){
    if (typeof obj == 'string') {
        obj = {msg: obj};
    };
    obj = extend({
        type: "error",
        msg: ""
    }, obj);
    throw obj;
}