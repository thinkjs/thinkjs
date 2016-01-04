'use strict';

import Base from './base.js';

/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */
export default class extends Base {
  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init(http = {}){
    this.http = http;
  }
  /**
   * get or set config
   * @param  {string} name  [config name]
   * @param  {mixed} value [config value]
   * @return {mixed}       []
   */
  config(name, value){
    return think.config(name, value, this.http._config);
  }
  /**
   * change module/controller/action when invoked action
   * @param  {Object} controller []
   * @param  {String} action     []
   * @return {Promise}            []
   */
  async _transMCAAction(controller, action){
    //change module/controller/action when invoke another action
    //make this.display() correct when invoked without any paramters
    let http = this.http;
    let source = {
      module: http.module,
      controller: http.controller,
      action: http.action
    };
    //parse module from pathname
    http.module = think.config('default_module');
    if(think.mode === think.mode_module){
      http.module = controller.__filename.split(think.sep).reverse()[2];
    }

    http.controller = this.basename(controller.__filename);
    http.action = action;
    if (action !== '__call') {
      action = think.camelCase(action) + 'Action';
    }
    let err;
    let result = await controller.invoke(action, controller).catch(e => {
      err = e;
    });
    think.extend(http, source);
    return err ? Promise.reject(err) : result;
  }
  /**
   * invoke action
   * @param  {Object} controller [controller instance]
   * @param  {String} action     [action name]
   * @param  {Mixed} data       [action params]
   * @return {}            []
   */
  action(controller, action, transMCA = true){
    if (think.isString(controller)) {
      controller = this.controller(controller);
    }
    if(!transMCA){
      if (action !== '__call') {
        action = think.camelCase(action) + 'Action';
      }
      return controller.invoke(action, controller);
    }
    return this._transMCAAction(controller, action);
  }
  /**
   * get or set cache
   * @param  {String} name    [cache name]
   * @param  {mixed} value   [cache value]
   * @param  {Object} options [cache options]
   * @return {}         []
   */
  cache(name, value, options){
    if(think.isString(options)){
      options = {type: options};
    }
    options = think.extend({}, this.config('cache'), options);
    return think.cache(name, value, options);
  }
  /**
   * invoke hook
   * @param  {String} event [event name]
   * @return {Promise}       []
   */
  hook(event, data){
    return think.hook.exec(event, this.http, data);
  }
  /**
   * get model
   * @param  {String} name    [model name]
   * @param  {Object} options [model options]
   * @return {Object}         [model instance]
   */
  model(name = 'base', options, module){
    if(think.isString(options)){
      options = {type: options};
    }
    options = think.extend({}, this.config('db'), options);
    return think.model(name, options, module || this.http.module);
  }
  /**
   * get controller
   * this.controller('home/controller/test')
   * @param  {String} name [controller name]
   * @return {Object}      []
   */
  controller(name, module){
    let Cls = think.lookClass(name, 'controller', module || this.http.module);
    return new Cls(this.http);
  }
  /**
   * get service
   * @param  {String} name [service name]
   * @return {Object}      []
   */
  service(name, module){
    return think.service(name, this.http, module || this.http.module);
  }
}