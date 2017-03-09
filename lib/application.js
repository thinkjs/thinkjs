const path = require('path');
const cluster = require('cluster');
const helper = require('think-helper');
const thinkLoader = require('./think.js');
const thinkCluster = require('think-cluster');
const pm2 = require('think-pm2');

const Graceful = thinkCluster.graceful;
/**
 * applition class
 */
module.exports = class Application {
  /**
   * constructor
   */
  constructor(options = {}){
    assert(options.ROOT_PATH, 'ROOT_PATH must be set');
    if(!options.APP_PATH){
      let name = options.transpiler ? 'app' : 'src';
      options.APP_PATH = path.join(options.ROOT_PATH, name);
    }
    thinkLoader(options);
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
    const transpiler = this.options.transpiler;
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
    }
    this.restartWorkers();
  }
  /**
   * restart workers
   */
  restartWorkers(){
    for(let id in cluster.workers){
      let worker = cluster.workers[id];

    }
  }
  /**
   * start watcher
   */
  startWatcher(){
    if(!this.options.watcher) return;
    this.options.watcher({
      srcPath: path.join(think.ROOT_PATH, 'src'),
      diffPath: think.APP_PATH
    }, fileInfo => this._watcherCallBack(fileInfo));
  }
  /**
   * start server
   */
  startServer(port, host){
    const createServer = () => {
      think.server = think.app.listen(port, host, () => {
        console.log(`Server running at http://${host}:${port}`);
      });
    }
    return think.beforeStartServer().then(() => createServer).catch(err => {
      think.logger.error(err);
      createServer();
    });
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
   * run
   */
  run(){
    const argv = this.parseArgv();
    if(argv.path){
      return;
    }
    if(think.app.env === 'development' && pm2.isClusterMode){
      throw new Error('can not use pm2 cluster mode in development env');
    }
    if(cluster.isMaster){
      this.startWatcher();
      const instance = new Graceful({
        logger: think.logger.error,
        workers: think.config('workers'),
        reloadSignal: think.config('reloadSignal')
      });
      instance.master();
    }else{
      let port = argv.port || think.config('port');
      const host = think.config('host');
      this.startServer(port, host).then(() => {
        const instance = new Graceful({
          logger: think.logger.error.bind(think.logger),
          server: think.server,
          captureSigint: pm2.isClusterMode,
          processKillTimeout: think.config('processKillTimeout'),
          onUncaughtException: think.config('onUncaughtException'),
          onUnhandledRejection: think.config('onUnhandledRejection')
        });
        instance.worker();
      });
    }
  }
}