const helper = require('think-helper');

const path = require('path');
const thinkFn = require('./core/think.js');
const cluster = require('cluster');

/**
 * applition class
 */
module.exports = class Application {
  /**
   * constructor
   */
  constructor(options = {}){
    this.options = options;
    thinkFn.init(options);
  }
  /**
   * set watcher
   */
  watch(watcher){
    this.watcher = watcher;
    return this;
  }
  /**
   * set transpile
   */
  transpile(handle, options = {}){
    this.transpilor = handle;
    this.transpileOptions = options;
    return this;
  }
  /**
   * start watcher
   */
  startWatcher(){
    if(!this.watcher) return;
    const self = this;
    function watcherCallBack(fileInfo){
      if(!self.transpilor) return;
      let ret = self.transpilor({
        srcPath: fileInfo.path,
        outPath: think.APP_PATH,
        file: fileInfo.file,
        options: self.transpileOptions
      });
      console.log('ret', ret);
    }
    this.watcher({
      srcPath: path.join(think.ROOT_PATH, 'src'),
      diffPath: think.APP_PATH
    }, watcherCallBack);
  }
  /**
   * start server
   */
  startServer(){
    if(think.isMaster){
      this.startWatcher();
      cluster.fork();
    }else{
      thinkFn.load();
      let port = think.config('port');
      //node index.js 1234
      if(/^\d{2,5}$/.test(process.argv[2])){
        port = process.argv[2];
      }
      const host = think.config('host');
      think.server = think.app.listen(port, host);
      console.log(`Server running at http://${host ? host : '127.0.0.1'}:${port}`);
    }
  }
}