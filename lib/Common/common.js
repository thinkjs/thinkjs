var fs = require("fs");
var path = require("path");
var util = require("util");
var crypto = require("crypto");

//when for global variables
global.when = require("when");
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
global.is_boolean = function(obj){
    return obj === true || obj === false;
}
global.is_number = function(obj){
    return Object.prototype.toString.call(obj) == '[object Number]';
}
global.is_object = function(obj){
    return Object.prototype.toString.call(obj) == '[object Object]';
}
global.is_string = function(obj){
    return Object.prototype.toString.call(obj) == '[object String]';
}
/**
 * 是否是个标量
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.is_scalar = function(obj){
    return is_boolean(obj) || is_number(obj) || is_string(obj);
}
global.is_array = Array.isArray;
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
global.is_number_string = function(obj){
    obj = obj + "";
    return ((parseFloat(obj, 10) || "")+"").length == obj.length;
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
 * 获取文件相关信息
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
global.file_state = function(file){
    if (!fs.existsSync(file)) {
        return false;
    };
    return fs.statSync(file);
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
/**
 * 设置文件内容
 * @param  {[type]} file [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
global.file_put_contents = function(file, data){
    return fs.writeFileSync(file, data);
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
global.throw_error = function(obj, http){
    if (is_string(obj)) {
        obj = {msg: obj};
    };
    obj = extend({
        type: "error",
        msg: "",
        http: http
    }, obj);
    if (http) {
        throw obj;
        return;
    };
    throw new Error(JSON.stringify(obj));
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
global.parse_name = function(name, type){
    name = (name + "").trim();
    if (type == 1) {
        name = name.replace(/_([a-zA-Z])/g, function(a, b){
            return b.toUpperCase();
        });
        return name.substr(0, 1).toUpperCase() + name.substr(1);
    } else {
        return name.replace(/[A-Z]/g, function(a){
            return "_" + a;
        }).toLowerCase();
    }
}