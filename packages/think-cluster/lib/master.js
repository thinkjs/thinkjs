const cluster = require('cluster');
const util = require('./util.js');
const debug = require('debug')('think-cluster');

/**
 * Master class
 */
class Master {
  /**
   * constructor
   * @param {Object} options 
   */
  constructor(options){
    this.options = util.parseOptions(options);
  }
  /**
   * capture reload signal
   */
  captureReloadSignal(){
    const signal = this.options.reloadSignal;
    process.on(signal, () => {
      for(let id in cluster.workers){
        let worker = cluster.workers[id];
        worker.send(util.THINK_RELOAD_SIGNAL);
      }
    });
  }
  /**
   * get fork env
   */
  getForkEnv(){
    return {
      THINK_WORKERS: this.options.workers, //workers num
    }
  }
  /**
   * fork agent worker
   */
  forkAgentWorker(callback){
    let worker = util.forkWorker({
      THINK_AGENT_WORKER: 1
    }, callback);
    worker.isAgent = true;
  }
  /**
   * fork workers
   */
  forkWorkers(){
    const forkWorker = (env = {}, address) => {
      let workers = this.options.workers;
      let index = 0;
      while(index++ < workers){
        env = Object.assign(env, this.getForkEnv());
        let worker = util.forkWorker(env);
        if(address){
          //send agent address
          worker.send(`{act: util.THINK_AGENT_OPTIONS, address}`);
        }
      }
    }
    if(this.options.enableAgent){
      this.forkAgentWorker((worker, address) => forkWorker({THINK_ENABLE_AGENT: 1}, address));
    }else{
      forkWorker();
    }
    if(this.options.reloadSignal){
      this.captureReloadSignal();
    }
  }
   /**
   * force reload all workers, in development env
   */
  forceReloadWorkers(){
    let aliveWorkers = [];
    for(let id in cluster.workers){
      let worker = cluster.workers[id];
      if(worker.state === 'disconnected'){
        continue;
      }
      aliveWorkers.push(worker);
    }
    if(!aliveWorkers.length) return;
    const firstWorker = aliveWorkers.shift();
    const worker = util.forkWorker(this.getForkEnv());
    //http://man7.org/linux/man-pages/man7/signal.7.html
    worker.once('listening', () => {
      firstWorker.kill('SIGQUIT');
      setTimeout(function () {
        firstWorker.process.kill('SIGQUIT');
      }, 100);
    });
    aliveWorkers.forEach(worker => {
      worker.kill('SIGQUIT');
      util.forkWorker(this.getForkEnv());
    });
  }
}

module.exports = Master;