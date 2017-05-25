const path = require('path');
const cluster = require('cluster');
const helper = require('think-helper');
const thinkLoader = require('./loader.js');
const thinkCluster = require('think-cluster');
const pm2 = require('think-pm2');
const assert = require('assert');
const mockHttp = require('think-mock-http');

/**
 * applition class
 */
module.exports = class Application {
  /**
   * constructor
   */
  constructor(options = {}){
    assert(options.ROOT_PATH, 'options.ROOT_PATH must be set');
    if(!options.APP_PATH){
      let appPath = path.join(options.ROOT_PATH, 'app');
      if(!options.transpiler && !helper.isDirectory(appPath)){
        appPath = path.join(options.ROOT_PATH, 'src');
      }
      options.APP_PATH = appPath;
    }
    this.options = options;
  }
  /**
   * notify error
   */
  notifier(err){
    if(!this.options.notifier) return;
    let notifier = this.options.notifier;
    if(!helper.isArray(notifier)){
      notifier = [notifier];
    }
    notifier[0](Object.assign({
      title: 'ThinkJS Transpile Error',
      message: err.message
    }, notifier[1]));
  }
  /**
   * watcher callback
   */
  _watcherCallBack(fileInfo){
    let transpiler = this.options.transpiler;
    if(transpiler){
      if(!helper.isArray(transpiler)){
        transpiler = [transpiler];
      }
      let ret = transpiler[0]({
        srcPath: fileInfo.path,
        outPath: think.APP_PATH,
        file: fileInfo.file,
        options: transpiler[1]
      });
      if(helper.isError(ret)){
        console.error(ret.stack);
        this.notifier(ret);
        return false;
      }
      think.logger.info(`transpile file ${fileInfo.file} success`);
    }
    //reload all workers
    if(this.masterInstance){
      this.masterInstance.forceReloadWorkers();
    }
  }
  /**
   * start watcher
   */
  startWatcher(){
    if(!this.options.watcher) return;
    const instance = new this.options.watcher({
      srcPath: path.join(think.ROOT_PATH, 'src'),
      diffPath: think.APP_PATH
    }, fileInfo => this._watcherCallBack(fileInfo));
    instance.watch();
  }
  /**
   * start server
   */
  startServer(port, host){
    const callback = () => {
      think.app.emit('appReady');
    }
    const createServer = () => {
      const createServerFn = think.config('createServer');
      if(createServerFn){
        assert(helper.isFunction(createServerFn), 'config.createServer must be a function');
        think.app.server = createServerFn(port, host, callback)
      }else{
        think.app.server = think.app.listen(port, host, callback);
      }
    }
    return think.beforeStartServer().catch(err => {
      think.logger.error(err);
    }).then(() => createServer());
  }
  /**
   * parse argv
   */
  parseArgv(){
    const argv2 = process.argv[2];
    const portRegExp = /^\d{2,5}$/;
    if(argv2){
      if(!portRegExp.test(argv2)){
        return {path: argv2};
      }
      return {port: argv2};
    }
    return {};
  }
  /**
   * run in master
   */
  runInMaster(){
    this.startWatcher();
    const instance = new thinkCluster.Master({
      workers: think.config('workers'),
      reloadSignal: think.config('reloadSignal'),
      enableAgent: think.config('enableAgent')
    });
    instance.forkWorkers().then(() => {
      think.app.emit('appReady');
    });
    this.masterInstance = instance;
  }
  /**
   * run in worker
   * @param {Object} argv 
   */
  runInWorker(argv){
    let port = argv.port || think.config('port');
    const host = think.config('host');
    const instance = new thinkCluster.Worker({
      debug: think.env === 'development',
      logger: think.logger.error.bind(think.logger),
      processKillTimeout: think.config('processKillTimeout'),
      onUncaughtException: think.config('onUncaughtException'),
      onUnhandledRejection: think.config('onUnhandledRejection')
    });
    think.app.once('appReady', () => {
      if(thinkCluster.isFirstWorker()){
        think.logger.info(`Server running at http://${host || '127.0.0.1'}:${port}`);
        think.logger.info(`ThinkJS version: ${think.version}`);
        think.logger.info(`Enviroment: ${think.app.env}`);
        think.logger.info(`Workers: ${instance.getWorkers()}`);
        //think.logger.info(`Agent Worker: ${instance.options.enableAgent}`);
      }
      instance.options.server = think.app.server;
      instance.captureEvents();
    });
    this.startServer(port, host);
  }
  /**
   * command line invoke
   */
  runInCli(cliPath){
    mockHttp({
      url: cliPath,
      method: 'CLI'
    }, think.app);
  }
  /**
   * run in agent
   */
  runInAgent(){
    const instance = new thinkCluster.Agent();
    instance.createServer();
  }
  /**
   * run
   */
  run(){
    if(pm2.isClusterMode){
      throw new Error('can not use pm2 cluster mode, please change exec_mode to fork');
    }
    const instance = new thinkLoader(this.options);
    const argv = this.parseArgv();
    try{
      instance.loadAll(!!argv.path);
    }catch(e){
      think.logger.error(e);
    }
    if(argv.path){
      return this.runInCli(argv.path);
    }else if(cluster.isMaster){
      this.runInMaster();
    }else if(thinkCluster.isAgent()){
      this.runInAgent();
    }else{
      this.runInWorker(argv);
    }
  }
}