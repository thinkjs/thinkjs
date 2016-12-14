// system module not use import
const fs = require('fs');
const path = require('path');
const util = require('util');
const crypto = require('crypto');
const net = require('net');
const cluster = require('cluster');

const fs_rmdir = promisify(fs.rmdir, fs);
const fs_unlink = promisify(fs.unlink, fs);
const fs_readdir = promisify(fs.readdir, fs);

const toString = Object.prototype.toString;
const numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
const preventError = 'PREVENT_NEXT_PROCESS';

export const {sep} = path;
export const isArray = Array.isArray;
export const isBuffer = Buffer.isBuffer;
export const isDate = util.isDate;
export const isRegExp = util.isRegExp;
export const isError = util.isError;
export const isIP = net.isIP;
export const isIPv4 = net.isIPv4;
export const isIPv6 = net.isIPv6;
export const isMaster = cluster.isMaster;
export const isDir = isDirectory;



/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
export function promisify(fn, receiver){
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, res) => {
        return err ? reject(err) : resolve(res);
      }]);
    });
  };
}

/**
 * check object is function
 * @param  {Mixed}  obj []
 * @return {Boolean}     []
 */
export function isFunction(obj){
  return typeof obj === 'function';
}


/**
 * extend object
 * @return {Object} []
 */
export function extend(target = {}, ...args) {
  let i = 0, length = args.length, options, name, src, copy;
  if(!target){
    target = isArray(args[0]) ? [] : {};
  }
  for(; i < length; i++){
    options = args[i];
    if (!options) {
      continue;
    }
    for(name in options){
      src = target[name];
      copy = options[name];
      if (src && src === copy) {
        continue;
      }
      if(isObject(copy)){
        target[name] = extend(src && isObject(src) ? src : {}, copy);
      }else if(isArray(copy)){
        target[name] = extend([], copy);
      }else{
        target[name] = copy;
      }
    }
  }
  return target;
}

/**
 * camelCase string
 * @param  {String} str []
 * @return {String}     []
 */
export function camelCase(str){
  if(str.indexOf('_') > -1){
    str = str.replace(/_(\w)/g, (a, b) => {
      return b.toUpperCase();
    });
  }
  return str;
}

/**
 * check object is boolean
 * @param  {Mixed}  obj []
 * @return {Boolean}     []
 */
export function isBoolean(obj){
  return toString.call(obj) === '[object Boolean]';
}

/**
 * check object is number
 * @param  {Mixed}  obj []
 * @return {Boolean}     []
 */
export function isNumber(obj){
  return toString.call(obj) === '[object Number]';
}

/**
 * check object is object
 * @param  {Mixed}  obj []
 * @return {Boolean}     []
 */
export function isObject(obj){
  return toString.call(obj) === '[object Object]';
}
/**
 * check object is string
 * @param  {Mixed}  obj []
 * @return {Boolean}     []
 */
export function isString(obj){
  return toString.call(obj) === '[object String]';
}
/**
 * clone data
 * @param  {Mixed} data []
 * @return {Mixed}      []
 */
export function clone(data){
  if (isObject(data)) {
    return extend({}, data);
  }else if (isArray(data)) {
    return extend([], data);
  }
  return data;
}

/**
 * check object is number string
 * @param  {Mixed}  obj []
 * @return {Boolean}     []
 */
export function isNumberString(obj){
  if(!obj){
    return false;
  }
  return numberReg.test(obj);
}



/**
 * true empty
 * @param  {Mixed} obj []
 * @return {Boolean}     []
 */
export function isTrueEmpty(obj){
  if(obj === undefined || obj === null || obj === ''){
    return true;
  }
  if(isNumber(obj) && isNaN(obj)){
    return true;
  }
  return false;
}

/**
 * check object is mepty
 * @param  {[Mixed]}  obj []
 * @return {Boolean}     []
 */
export function isEmpty(obj){
  if(isTrueEmpty(obj)){
    return true;
  }
  if (isObject(obj)) {
    for(let key in obj){
      return false && key; // only for eslint
    }
    return true;
  }else if (isArray(obj)) {
    return obj.length === 0;
  }else if (isString(obj)) {
    return obj.length === 0;
  }else if (isNumber(obj)) {
    return obj === 0;
  }else if (isBoolean(obj)) {
    return !obj;
  }
  return false;
}


/**
 * get deferred object
 * @return {Object} []
 */
export function defer(){
  let deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}


/**
 * get content md5
 * @param  {String} str [content]
 * @return {String}     [content md5]
 */
export function md5(str){
  let instance = crypto.createHash('md5');
  instance.update(str + '', 'utf8');
  return instance.digest('hex');
}

/**
 * escape html
 */
export function escapeHtml(str){
  return (str + '').replace(/[<>'"]/g, a => {
    switch(a){
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quote;';
      case '\'':
        return '&#39;';
    }
  });
}

/**
 * get datetime
 * @param  {Date} date []
 * @return {String}      []
 */
export function datetime(date, format) {
  let fn = d => {
    return ('0' + d).slice(-2);
  };

  if(date && isString(date)){
    date = new Date(Date.parse(date));
  }
  let d = date || new Date();

  format = format || 'YYYY-MM-DD HH:mm:ss';
  let formats = {
    YYYY: d.getFullYear(),
    MM: fn(d.getMonth() + 1),
    DD: fn(d.getDate()),
    HH: fn(d.getHours()),
    mm: fn(d.getMinutes()),
    ss: fn(d.getSeconds())
  };

  return format.replace(/([a-z])\1+/ig, a => {
    return formats[a] || a;
  });
}

/**
 * prevent next process
 */
export function prevent(ret){
  if(ret){
    return new Error(preventError);
  }
  throw new Error(preventError);
}

/**
 * is prevent error
 */
export function isPrevent(err){
  return isError(err) && err.message === preventError;
}


/**
 * get uuid
 * @param  {Number} length [uid length]
 * @return {String}        []
 */
export function uuid(length = 32){
  let str = crypto.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
  return str.replace(/[\+\/]/g, '_');
}



/**
 * check path is exist
 */
export function isExist(dir) {
  dir = path.normalize(dir);
  if (fs.accessSync) {
    try {
      fs.accessSync(dir, fs.R_OK);
      return true;
    } catch (e) {
      return false;
    }
  }
  return fs.existsSync(dir);
}

/**
 * check filepath is file
 */
export function isFile(filePath) {
  if (!isExist(filePath)) {
    return false;
  }
  let stat = fs.statSync(filePath);
  return stat.isFile();
}


/**
 * check path is directory
 */
export function isDirectory(filePath) {
  if (!isExist(filePath)) {
    return false;
  }
  let stat = fs.statSync(filePath);
  return stat.isDirectory();
}

/**
 * change path mode
 * @param  {String} p    [path]
 * @param  {String} mode [path mode]
 * @return {Boolean}      []
 */
export function chmod(p, mode = '0777'){
  if (!isExist(p)) {
    return true;
  }
  return fs.chmodSync(p, mode);
}

/**
 * make dir
 */
export function mkdir(dir, mode = '0777') {
  if (isExist(dir)) {
    return chmod(dir, mode);
  }
  let pp = path.dirname(dir);
  if (isExist(pp)) {
    try {
      fs.mkdirSync(dir, mode);
      return true;
    } catch (e) {
      return false;
    }
  }
  if (mkdir(pp, mode)) {
    return mkdir(dir, mode);
  } else {
    return false;
  }
}

/**
 * remove dir aync
 * @param  {String} p       [path]
 * @param  {Bollean} reserve []
 * @return {Promise}         []
 */
export function rmdir(p, reserve){
  if (!isDirectory(p)) {
    return Promise.resolve();
  }
  return fs_readdir(p).then(files => {
    let promises = files.map(item => {
      let filepath = path.normalize(p + sep + item);
      if(isDirectory(filepath)){
        return rmdir(filepath, false);
      }
      return fs_unlink(filepath);
    });
    return Promise.all(promises).then(() => {
      if(!reserve){
        return fs_rmdir(p);
      }
    });
  });
}

/**
 * get files in path
 * @param  {} dir    []
 * @param  {} prefix []
 * @return {}        []
 */
export function getFiles(dir, prefix = '', filter){
  dir = path.normalize(dir);
  if (!isExist(dir)) {
    return [];
  }
  if(!isString(prefix)){
    filter = prefix;
    prefix = '';
  }
  if(filter === true){
    filter = item => {
      return item[0] !== '.';
    };
  }
  let files = fs.readdirSync(dir);
  let result = [];
  files.forEach(item => {
    let stat = fs.statSync(dir + sep + item);
    if (stat.isFile()) {
      if(!filter || filter(item)){
        result.push(prefix + item);
      }
    }else if(stat.isDirectory()){
      if(!filter || filter(item, true)){
        let cFiles = getFiles(dir + sep + item, prefix + item + sep, filter);
        result = result.concat(cFiles);
      }
    }
  });
  return result;
}