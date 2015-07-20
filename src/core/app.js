'use strict';

import cluster from 'cluster';
import fs from 'fs';
import domain from 'domain';
import os from 'os';
import http from 'http';

let websocket = think.require('websocket');

export default class extends think.base {
  /**
   * send error
   * @param  {Error} err []
   * @return {}     []
   */
  error(err){
    return think.hook('app_error', this.http, err);
  }
  /**
   * dispath route
   * @return {} []
   */
  async dispatcher(){
    await this.hook('resource_check');
    await this.hook('route_parse');
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
    let action = this.http.action;
    if (think.isFunction(instance[action + think.config('action_suffix')])) {
      return this.action(instance, action);
    }
    //call action
    else if (think.isFunction(instance.__call)) {
      return this.action(instance, '__call');
    }
    //only has before method
    else if(think.isFunction(instance.__before)){
      return instance.__before(instance);
    }
  }
  /**
   * exec controller
   * @return {Promise} []
   */
  execController(){
    let http = this.http;
    let name = `${http.module}/${think.dirname.controller}/${http.controller}`;
    let cls = think.require(name, true);
    if (cls) {
      return this.execAction(new cls(http));
    }
    return this.execCallController();
  }
  /**
   * exec call controller
   * @return {Promise} []
   */
  execCallController(flag){
    let http = this.http;
    let cls = think.require('call_controller', true);
    if (cls) {
      return this.execAction(new cls(http), true);
    }
    if(flag){
      return false;
    }
    let err = new Error(think.local('CONTROLLER_NOT_FOUND', http.controller, http.url));
    return think.reject(err);
  }
  /**
   * exec action
   * @param  {Object} controller [controller instance]
   * @param  {Boolean} call       [is call controller]
   * @return {Promise}            []
   */
  execAction(controller, isCall){
    if(isCall){
      return this.action(controller, think.config('call_action'));
    }
    let action = this.http.action;
    let actionWithSuffix = action + think.config('action_suffix');
    //action is exist
    if(think.isFunction(controller[actionWithSuffix])){
      return this.action(controller, action);
    }
    //call action
    if(think.isFunction(controller.__call)){
      return this.action(controller, '__call');
    }
    //try to exec call controller
    if(!isCall){
      let ret = this.execCallController(true);
      if(ret){
        return ret;
      }
    }
    let err = new Error(think.local('ACTION_NOT_FOUND', action, this.http.url));
    return think.reject(err);
  }
  /**
   * exec 
   * @return {Promise} []
   */
  async exec(){
    await this.execLogic();
    //http is end
    if (this.http._isEnd) {
      return think.prevent();
    }
    return this.execController();
  }
  /**
   * run
   * @return {} []
   */
  run(){
    let http = this.http;
    http.header('X-Powered-By', `thinkjs-${think.version}`);
    //deny access by ip + port
    if (think.config('proxy_on') && http.host !== http.hostname && !http.websocket) {
      http.res.statusCode = 403;
      http.end('proxy on, cannot visit with port');
      return;
    }
    let instance = domain.create();
    instance.on('error', err => this.error(err));
    instance.run(async () => {
      try{
        await this.dispatcher();
        //set module config
        this.http._config = think.extend({}, think.getModuleConfig(this.http.module));
        await this.hook('app_begin');
        await this.exec();
        await this.hook('app_end');
      }catch(err){
        this.error(err);
      }
    });
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
    let callback = async (req, res) => {
      let http = await think.http(req, res);
      try{
        return new this(http).run();
      }catch(e){
        think.log(e);
      }
    };
    //define createServer in application
    if (handle) {
      handle(callback, port, host, this);
    }else{
      //create server
      let server = http.createServer(callback);
      if (think.config('websocket.on')) {
        (new websocket(server, this)).run();
      }
      server.listen(port, host);
      this.logPid(port);
    }
    think.log('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/', 'THINK');
    if (think.debug) {
      think.log('App debug is open', 'THINK');
    }
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
   * load process id
   * @return {} []
   */
  static logPid(port){
    if (!cluster.isMaster || !think.config('log_pid')) {
      return;
    }
    let dir = think.getPath(undefined, think.dirname.runtime) + '/pid';
    think.mkdir(dir);
    let pidFile = `${dir}/${port}.pid`;
    fs.writeFileSync(pidFile, process.pid);
    //change pid file mode
    think.chmod(pidFile);
    //remove pid file when process exit
    process.on('SIGTERM', () => {
      if (fs.existsSync(pidFile)) {
        fs.unlinkSync(pidFile);
      }
      process.exit(0);
    });
  }
  /**
   * http mode
   * @return {} []
   */
  static http(){
    let nums = think.config('cluster_on');
    if (!nums) {
      return this.createServer();
    }
    if (nums === true) {
      nums = os.cpus().length;
    }
    if (cluster.isMaster) {
      think.log('use cluster, fork nums ' + nums, 'THINK');
      for (let i = 0; i < nums; i++) {
        cluster.fork();
      }
      cluster.on('exit', worker => {
        let err = new Error(think.local('WORKER_DIED', worker.process.pid));
        think.log(err, 'worker');
        process.nextTick(() => cluster.fork());
      });
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