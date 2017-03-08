const path = require('path');
const cluster = require('cluster');
const helper = require('think-helper');
const thinkLoader = require('./think.js');
const thinkCluster = require('think-cluster');

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
    think.server = think.app.listen(port, host, () => {
      process.send('ready');
      console.log(`Server running at http://${host ? host : '127.0.0.1'}:${port}`);
    });
    thinkCluster.graceful({
      server: think.server,
      logger: think.logger
    });
  }
  /**
   * run
   */
  run(){
    const portRegExp = /^\d{2,5}$/;
    const argv2 = process.argv[2];
    if(argv2 && !portRegExp.test(argv2)){
      
      return;
    }
    if(cluster.isMaster){
      this.startWatcher();
      thinkCluster.graceful({
        workers: think.config('workers')
      });
    }else{
      let port = think.config('port');
      //node index.js 1234
      if(portRegExp.test(argv2)){
        port = argv2;
      }
      const host = think.config('host');
      think.beforeStartServer().then(err => {
        if(helper.isError(err)){
          
        }
        this.startServer(port, host);
      });
    }
  }
}