'use strict';

let cluster = require('cluster');
let fs = require('fs');
let domain = require('domain');
let os = require('os');
let http = require('http');

let websocket = think.require('websocket');

module.exports = class extends think.base {
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
    this.http._config = think.extend({}, think.getModuleConfig(this.http.module));
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
    let call = 'call_controller';
    cls = think.require(call, true);
    if (cls) {
      return this.execAction(cls(http), true);
    }
    let err = new Error(think.message('CONTROLLER_NOT_FOUND', http.controller, http.url));
    return Promise.reject(err);
  }
  /**
   * exec action
   * @param  {Object} controller [controller instance]
   * @param  {Boolean} call       [is call controller]
   * @return {Promise}            []
   */
  execAction(controller, isCall){
    let action;
    if (isCall) {
      action = think.config('call_action');
    }else{
      action = this.http.action;
      //action not exist
      if (!think.isFunction(controller[action + think.config('action_suffix')])) {
        //__call not exist
        if (!think.isFunction(controller.__call)) {
          let err = new Error(think.message('ACTION_NOT_FOUND', action, this.http.url));
          return Promise.reject(err);
        }
        action = '__call';
      }
    }
    return this.action(controller, action);
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
      http.end('proxy on, cannot visit by port');
      return;
    }
    let instance = domain.create();
    instance.on('error', (err) => this.error(err));
    instance.run(async () => {
      try{
        await this.dispatcher();
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
      return new this(http).run();
    }
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
    console.log('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/');
    if (think.debug) {
      console.log('app debug is open');
    }
  }
  /**
   * cli mode
   * @return {} []
   */
  static async cli(){
    let http = await think.http(think.url);
    return new this(http).listener();
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
      console.log('use cluster, fork nums ' + nums);
      for (let i = 0; i < nums; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker) => {
        let err = new Error(think.message('WORKER_DIED', worker.process.pid))
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
    if (think.mode === 'cli') {
      return this.cli();
    }
    return this.http();
  }
}