'use strict';

import cluster from 'cluster';
import domain from 'domain';
import os from 'os';
import http from 'http';

export default class extends think.http.base {
  /**
   * invoke logic
   * @return {} []
   */
  invokeLogic(){
    if(!think.config('logic_on')){
      return;
    }

    return this.hook('logic_before').then(() => {
      return this.execLogic();
    }).catch(err => {
      //ignore prevent reject promise
      //make logic_after hook can be invoked
      if(!think.isPrevent(err)){
        return Promise.reject(err);
      }
    }).then(() => {
      return this.hook('logic_after');
    }).then(() => {
      //http is end
      if (this.http._isEnd) {
        return think.prevent();
      }
    });
  }
  /**
   * exec logic
   * @return {Promise} []
   */
  execLogic(){
    let name = `${this.http.module}/${think.dirname.logic}/${this.http.controller}`;
    let cls = think.require(name, true);
    if (!cls) {
      return Promise.resolve();
    }
    let instance = new cls(this.http);
    let action = think.camelCase(this.http.action);
    if (instance[`${action}Action`]) {
      return this.action(instance, action, false);
    }
    //call action
    if (instance.__call) {
      return this.action(instance, '__call', false);
    }
    //only has before method
    if(instance.__before){
      return think.co(instance.__before(instance));
    }
    return Promise.resolve();
  }
  /**
   * invoke controller
   * @return {} []
   */
  invokeController(controller){
    return this.hook('controller_before').then(() => {
      return this.execController(controller);
    }).catch(err => {
      //ignore prevent reject promise
      //make controller_after & response_end hook can be invoked
      if(!think.isPrevent(err)){
        return Promise.reject(err);
      }
    }).then(() => {
      return this.hook('controller_after');
    });
  }
  /**
   * get controller instance
   * @return {} []
   */
  getControllerInstance(){
    let http = this.http;
    let name = `${http.module}/${think.dirname.controller}/${http.controller}`;
    let Controller = think.require(name, true);
    if (!Controller) {
      return;
    }
    let instance = new Controller(http);
    //rewrite action when controller is rest
    if(instance._isRest){
      let method = instance._method;
      //get method from GET params
      if(method){
        method = instance.get(method).toLowerCase();
      }
      if(!method){
        method = this.http.method.toLowerCase();
      }
      this.http.action = method;
    }
    return instance;
  }
  /**
   * exec controller
   * @return {Promise} []
   */
  execController(controller){
    if (controller) {
      return this.execAction(controller);
    }
    let http = this.http;
    http.error = new Error(think.locale('CONTROLLER_NOT_FOUND', http.controller, http.url));
    return think.statusAction(404, http);
  }
  /**
   * exec action
   * @param  {Object} controller [controller instance]
   * @param  {Boolean} call       [is call controller]
   * @return {Promise}            []
   */
  execAction(controller){
    let http = this.http;
    let action = think.camelCase(http.action);
    let actionWithSuffix = `${action}Action`;
    //action is exist
    if(controller[actionWithSuffix]){
      return this.action(controller, action, false);
    }
    //call action
    if(controller.__call){
      return this.action(controller, '__call', false);
    }
    http.error = new Error(think.locale('ACTION_NOT_FOUND', actionWithSuffix, http.url));
    return think.statusAction(404, http);
  }

  /**
   * exec 
   * @return {Promise} []
   */
  async exec(){
    await this.hook('resource');
    await this.hook('route_parse');

    //set module config, can not set config in request
    this.http._config = thinkData.config[this.http.module];
    //console.log(eval('%HasFastProperties(this.http._config)'));

    //babel compile error
    if(think.compileError){
      this.http.error = think.compileError;
      return think.statusAction(500, this.http);
    }
    //must get controller before invoke logic
    let controller = this.getControllerInstance();

    await this.invokeLogic();
    await this.invokeController(controller);
    await this.hook('response_end');
  }
  /**
   * exec error
   * @param  {Error} err []
   * @return {}     []
   */
  execError(err){
    let http = this.http;
    http.error = err;
    return think.statusAction(500, http, true).catch(() => {});
  }
  /**
   * run
   * @return {} []
   */
  run(){
    let http = this.http;
    http.header('X-Powered-By', `thinkjs-${think.version}`);
    
    if(think.config('domain_on')){
      let instance = domain.create();
      instance.on('error', err => {
        this.execError(err);
      });
      instance.run(() => {
        this.exec().catch(err => {
          this.execError(err);
        });
      });
    }else{
      this.exec().catch(err => {
        this.execError(err);
      });
    }
  }
  /**
   * create server
   * @return {} []
   */
  static createServer(){
    let handle = think.config('create_server');
    let host = think.config('host');
    let port = think.port || think.config('port'); 
    //createServer callback
    let callback = (req, res) => {
      think.http(req, res).then(http => {
        new this(http).run();
      });
    };
    let server;
    //define createServer in application
    if (handle) {
      server = handle(callback, port, host, this);
    }else{
      //create server
      server = http.createServer(callback);
      server.listen(port, host);
    }
    think.server = server;
    //start websocket
    let websocket = think.parseConfig(think.config('websocket'));
    if(websocket.on){
      let Cls = think.adapter('websocket', websocket.type);
      let instance = new Cls(server, websocket, this);
      instance.run();
    }
  }
  /**
   * log
   * @return {} []
   */
  static log(){
    let host = think.config('host');
    let port = think.port || think.config('port'); 
    let websocketStatus = think.config('websocket.on') ? 'open' : 'closed';
    let clusterStatus = think.config('cluster_on') ? 'open' : 'closed';

    let url = `http://${(host || '127.0.0.1')}:${port}/`;
    think.log(colors => `Server running at ${colors.green(url)}`, 'THINK');
    think.log(colors => `ThinkJS Version: ${colors.magenta(think.version)}`, 'THINK');
    think.log(colors => `Cluster Status: ${colors.magenta(clusterStatus)}`, 'THINK');
    think.log(colors => `WebSocket Status: ${colors.magenta(websocketStatus)}`, 'THINK');
    think.log(colors => `File Auto Compile: ${colors.magenta(!!think.autoCompile)}`, 'THINK');
    think.log(colors => `File Auto Reload: ${colors.magenta(think.config('auto_reload'))}`, 'THINK');
    think.log(colors => `App Enviroment: ${colors.magenta(think.env)}\n`, 'THINK');
  }
  /**
   * cli mode
   * @return {} []
   */
  static async cli(){
    let http = await think.http(think.cli);
    return new this(http).run();
  }
  /**
   * http mode
   * @return {} []
   */
  static http(){
    let nums = think.config('cluster_on');
    if (!nums) {
      this.createServer();
      return this.log();
    }
    if (nums === true) {
      nums = os.cpus().length;
    }
    if (cluster.isMaster) {
      for (let i = 0; i < nums; i++) {
        cluster.fork();
      }
      cluster.on('exit', worker => {
        think.log(new Error(think.locale('WORKER_DIED', worker.process.pid)), 'THINK');
        process.nextTick(() => cluster.fork());
      });
      this.log();
    }else {
      this.createServer();
    }
  }
  /**
   * run
   * @return {} []
   */
  static run(){
    if (think.cli) {
      return this.cli();
    }
    return this.http();
  }
}
