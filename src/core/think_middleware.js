'use strict';

/**
 * create or exec middleware
 * @param  {Function} superClass []
 * @param  {Object} methods      []
 * @return {mixed}            []
 */
let Middleware = (...args) => {
  let [superClass, methods, data] = args;
  let length = args.length;

  // register functional or class middleware
  // think.middleware('parsePayLoad', function(){})
  if (think.isString(superClass) && think.isFunction(methods)) {
    thinkData.middleware[superClass] = methods;
    return;
  }
  // exec middleware
  // think.middleware('parsePayLoad', http, data)
  if (length >= 2 && think.isHttp(methods)) {
    return Middleware.exec(superClass, methods, data);
  }
  // get middleware
  // think.middleware('parsePayLoad')
  if (length === 1 && think.isString(superClass)) {
    return Middleware.get(superClass);
  }
  return Middleware.create(superClass, methods);
};

/**
 * create middleware
 * @param  {Class} superClass []
 * @param  {Object} methods    []
 * @return {Class}            []
 */
Middleware.create = (superClass, methods) => {
  let middleware = thinkCache(thinkCache.COLLECTION, 'middleware');
  if (!middleware) {
    middleware = think.Class('middleware');
    thinkCache(thinkCache.COLLECTION, 'middleware', middleware);
  }
  // create middleware
  return middleware(superClass, methods);
};

/**
 * get middleware
 * @param  {String} name []
 * @return {Class}      []
 */
Middleware.get = name => {
  let middlware = thinkData.middleware[name];
  if(middlware){
    return middlware;
  }
  let cls = think.require('middleware_' + name, true);
  if (cls) {
    return cls;
  }
  throw new Error(think.locale('MIDDLEWARE_NOT_FOUND', name));
};

/**
 * exec middleware
 * @param  {String} name []
 * @param  {Object} http []
 * @param  {Mixed} data []
 * @return {Promise}      []
 */
Middleware.exec = (name, http, data) => {
  if (think.isString(name)) {
    let fn = thinkData.middleware[name];
    // name is in middleware cache
    if (fn) {
      //class middleware must have run method
      if(fn.prototype.run){
        let instance = new fn(http);
        return think.co(instance.run(data));
      }else{
        return think.co(fn(http, data));
      }
    }else{
      let Cls = think.require('middleware_' + name, true);
      if(Cls){
        let instance = new Cls(http);
        return think.co(instance.run(data));
      }
      let err = new Error(think.locale('MIDDLEWARE_NOT_FOUND', name));
      return Promise.reject(err);
    }
  }
  return think.co(name(http, data));
};

export default Middleware;