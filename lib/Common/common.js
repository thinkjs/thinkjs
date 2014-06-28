var fs = require('fs');
var path = require('path');
var util = require('util');
var crypto = require('crypto');
var net = require('net');

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
global.Class = function (prop, superCls) {
  'use strict';
  var cls = function () {
    function T(args) {
      for(var name in cls.__prop){
        var val = cls.__prop[name];
        this[name] = isObject(val) ? extend({}, val) : val;
      }
      //自动执行init方法
      if(isFunction(this.init)){
        //获取init返回值，如果返回一个promise，可以让后续执行在then之后
        this.__initReturn = this.init.apply(this, args);
      }
      return this;
    }
    T.prototype = cls.prototype;
    T.constructor = cls;
    return new T(arguments);
  };
  //类的属性，不放在原型上，实例化的时候调用
  cls.__prop = {};
  cls.extend = function(prop){
    if (isFunction(prop)) {
      prop = prop();
    }
    if (isObject(prop)) {
      for(var name in prop){
        var val = prop[name];
        if (isFunction(val)) {
          this.prototype[name] = val;
        }else{
          cls.__prop[name] = isObject(val) ? extend({}, val) : val;
        }
      }
    }
    return this;
  };
  cls.inherits = function(superCls){
    util.inherits(this, superCls);
    //将父级的属性复制到当前类上
    extend(cls.__prop, superCls.__prop);
    return this;
  };
  if (superCls === true && isFunction(prop)) {
    superCls = prop;
    prop = undefined;
  }
  if (isFunction(superCls)) {
    cls.inherits(superCls);
  }
  //调用父级方法
  cls.prototype.super = cls.prototype.super_ = function(name, data){
    if (!this[name]) {
      return;
    }
    if (!isArray(data)) {
      data = [data];
    }
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
  };
  if (prop) {
    cls.extend(prop);
  }
  return cls;
};
/**
 * extend, from jquery，具有深度复制功能
 * @return {[type]} [description]
 */
global.extend = function(){
  'use strict';
  var args = [].slice.call(arguments);
  var deep = true;
  var target = args.shift();
  if (isBoolean(target)) {
    deep = target;
    target = args.shift();
  }
  target = target || {};
  var length = args.length;
  var options, name, src, copy, copyAsArray, clone;
  for(var i = 0; i < length; i++){
    options = args[i] || {};
    if (isFunction(options)) {
      options = options();
    }
    for(name in options){
      src = target[name];
      copy = options[name];
      if (src === copy) {
        continue;
      }
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
      }
    }
  }
  return target;
};


//Object上toString方法
var toString = Object.prototype.toString;

/**
 * 是否是boolean
 * @param  {[type]}  obj
 * @return {Boolean}
 */
global.isBoolean = function(obj){
  'use strict';
  return toString.call(obj) === '[object Boolean]';
};
/**
 * 是否是数字
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isNumber = function(obj){
  'use strict';
  return toString.call(obj) === '[object Number]';
};
/**
 * 是否是个对象
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isObject = function(obj){
  'use strict';
  return toString.call(obj) === '[object Object]';
};
/**
 * 是否是字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isString = function(obj){
  'use strict';
  return toString.call(obj) === '[object String]';
};
/**
 * 是否是个function
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isFunction = function(obj){
  'use strict';
  return typeof obj === 'function';
};
/**
 * 是否是日期
 * @return {Boolean} [description]
 */
global.isDate = function(obj){
  'use strict';
  return util.isDate(obj);
};
/**
 * 是否是正则
 * @param  {[type]}  reg [description]
 * @return {Boolean}     [description]
 */
global.isRegexp = function(obj){
  'use strict';
  return util.isRegExp(obj);
};
/**
 * 是否是个错误
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isError = function(obj){
  'use strict';
  return util.isError(obj);
};
/**
 * 判断对象是否为空
 * @param  {[type]}  obj
 * @return {Boolean}
 */
global.isEmpty = function(obj){
  'use strict';
  if (isObject(obj)) {
    var key;
    for(key in obj){
      return false;
    }
    return true;
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
  }
  return false;
};
/**
 * 是否是个标量
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isScalar = function(obj){
  'use strict';
  return isBoolean(obj) || isNumber(obj) || isString(obj);
};
/**
 * 是否是个数组
 * @type {Boolean}
 */
global.isArray = Array.isArray;
/**
 * 是否是IP
 * @type {Boolean}
 */
global.isIP = net.isIP;
global.isIP4 = net.isIP4;
global.isIP6 = net.isIP6;
/**
 * 是否是个文件
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
global.isFile = function(p){
  'use strict';
  if (!fs.existsSync(p)) {
    return false;
  }
  var stats = fs.statSync(p);
  return stats.isFile();
};
/**
 * 是否是个目录
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
global.isDir = function(p){
  'use strict';
  if (!fs.existsSync(p)) {
    return false;
  }
  var stats = fs.statSync(p);
  return stats.isDirectory();
};
/**
 * 是否是buffer
 * @type {Boolean}
 */
global.isBuffer = Buffer.isBuffer;
/**
 * 是否是个数字的字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var numberReg = /^((\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
global.isNumberString = function(obj){
  'use strict';
  return numberReg.test(obj);
};
/**
 * 判断是否是个promise
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isPromise = function(obj){
  'use strict';
  return obj && typeof obj.then === 'function';
};

/**
 * 判断一个文件或者目录是否可写
 * @param  {[type]}  p [description]
 * @return {Boolean}      [description]
 */
global.isWritable = function(p){
  'use strict';
  if (!fs.existsSync(p)) {
    return false;
  }
  var stats = fs.statSync(p);
  var mode = stats.mode;
  var uid = process.getuid ? process.getuid() : 0;
  var gid = process.getgid ? process.getgid() : 0;
  var owner = uid === stats.uid;
  var group = gid === stats.gid;
  return !!(owner && (mode & parseInt('00200', 8)) || 
      group && (mode & parseInt('00020', 8)) || 
      (mode & parseInt('00002', 8)));
};

/**
 * 递归创建目录，同步模式
 * @param  {[type]} p    [description]
 * @param  {[type]} mode [description]
 * @return {[type]}      [description]
 */
global.mkdir = function(p, mode){
  'use strict';
  mode = mode || '0777';
  if (fs.existsSync(p)) {
    chmod(p, mode);
    return true;
  }
  var pp = path.dirname(p);
  if (fs.existsSync(pp)) {
    fs.mkdirSync(p, mode);
  }else{
    mkdir(pp, mode);
    mkdir(p, mode);
  }
  return true;
};
/**
 * 修改目录或者文件权限
 * @param  {[type]} p    [description]
 * @param  {[type]} mode [description]
 * @return {[type]}      [description]
 */
global.chmod = function(p, mode){
  'use strict';
  mode = mode || '0777';
  if (!fs.existsSync(p)) {
    return true;
  }
  return fs.chmodSync(p, mode);
};
/**
 * 获取文件内容
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
global.getFileContent = function(file, encoding){
  'use strict';
  if (!fs.existsSync(file)) {
    return '';
  }
  return fs.readFileSync(file, {
    encoding: encoding || 'utf8'
  });
};
/**
 * 设置文件内容
 * @param  {[type]} file [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
global.setFileContent = function(file, data){
  'use strict';
  return fs.writeFileSync(file, data);
};
/**
 * 大写首字符
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
global.ucfirst = function(name){
  'use strict';
  name = name || '';
  return name.substr(0,1).toUpperCase() + name.substr(1).toLowerCase();
};
/**
 * 获取字符串的md5
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
global.md5 = function(str){
  'use strict';
  var instance = crypto.createHash('md5');
  instance.update(str + '');
  return instance.digest('hex');
};
/**
 * 生成一个promise,如果传入的参数是promise则直接返回
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
global.getPromise = function(obj, reject){
  'use strict';
  if (isPromise(obj)) {
    return obj;
  }
  if (reject) {
    return Promise.reject(obj);
  }
  return Promise.resolve(obj);
};
/**
 * 生成一个defer对象
 * @return {[type]} [description]
 */
global.getDefer = function(){
  'use strict';
  var deferred = {};
  deferred.promise = new Promise(function(resolve, reject){
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};
/**
 * 快速生成一个object
 * @param  {[type]} key   [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
global.getObject = function(key, value){
  'use strict';
  var obj = {};
  if (!isArray(key)) {
    obj[key] = value;
    return obj;
  }
  key.forEach(function(item, i){
    obj[item] = value[i];
  });
  return obj;
};
/**
 * 将数组变成对象
 * @param  {[type]} arr       [description]
 * @param  {[type]} key       [description]
 * @param  {[type]} valueKeys [description]
 * @return {[type]}           [description]
 */
global.arrToObj = function(arr, key, valueKey){
  'use strict';
  var result = {};
  var arrResult = [];
  arr.forEach(function(item){
    var keyValue = item[key];
    if (valueKey === null) {
      arrResult.push(keyValue);
    }else if (valueKey) {
      result[keyValue] = item[valueKey];
    }else{
      result[keyValue] = item;
    }
  })
  return valueKey === null ? arrResult : result;
}