const path = require('path');
const cluster = require('cluster');
const helper = require('think-helper');
const thinkLoader = require('./loader.js');
const thinkCluster = require('think-cluster');
const pm2 = require('think-pm2');
const assert = require('assert');

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
    const instance = new thinkLoader(options);
    instance.loadAll();
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
      think.app.emit('startServer');
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
      logger: think.logger.error,
      workers: think.config('workers'),
      reloadSignal: think.config('reloadSignal')
    });
    instance.forkWorkers();
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
      logger: think.logger.error.bind(think.logger),
      captureSigint: pm2.isClusterMode,
      disableKeepAlive: !!this.options.watcher,
      processKillTimeout: think.config('processKillTimeout'),
      onUncaughtException: think.config('onUncaughtException'),
      onUnhandledRejection: think.config('onUnhandledRejection')
    });
    think.app.once('startServer', () => {
      if(thinkCluster.isFirstWorker()){
        think.logger.info(`Server running at http://${host || '127.0.0.1'}:${port}`);
        think.logger.info(`ThinkJS version: ${think.version}`);
        think.logger.info(`Enviroment: ${think.app.env}`);
        let workers = instance.getWorkers();
        if(workers){
          think.logger.info(`Cluster workers: ${workers}`);
        }
        think.logger.info(`Agent Worker: ${instance.options.agent}`);
        think.logger.info(`Worker Delegate: ${instance.options.delegate}`);
      }
      instance.options.server = think.app.server;
      instance.captureEvents();
    });
    this.startServer(port, host);
  }
  /**
   * command line invoke
   */
  runInCli(){
    
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
    const argv = this.parseArgv();
    if(argv.path){
      return this.runInCli(argv.path);
    }
    if(this.options.watcher && pm2.isClusterMode){
      throw new Error('can not use pm2 cluster mode in development env');
    }
    if(cluster.isMaster){
      this.runInMaster();
    }else if(thinkCluster.isAgent()){
      this.runInAgent();
    }else{
      this.runInWorker(argv);
    }
  }
}