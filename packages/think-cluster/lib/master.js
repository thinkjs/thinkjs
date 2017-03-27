const cluster = require('cluster');
const util = require('./util.js');

let isFirstWorker = true;

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
    let first = isFirstWorker;
    isFirstWorker = false;
    return {
      THINK_FIRST_WORKER: first ? 1 : 0, //is first worker
      THINK_WORKERS: this.options.workers, //workers num
      THINK_CLUSTER: 1, //
    }
  }
  /**
   * fork agent worker
   */
  forkAgentWorker(callback){
    let worker = util.forkWorker({
      THINK_AGENT_WORKER: 1
    });
    worker.isAgent = true;
    worker.on('message', msg => {
      if(msg.cmd === util.THINK_AGENT_OPTIONS){
        callback(msg.address);
      }
    });
  }
  /**
   * fork workers
   */
  forkWorkers(){
    const forkWorker = address => {
      let workers = this.options.workers;
      let index = 0;
      let env = {};
      if(address){
        env.THINK_AGENT_OPTIONS = JSON.stringify(address);
      }
      while(index++ < workers){
        util.forkWorker(Object.assign({}, env, this.getForkEnv()));
      }
    }
    if(this.options.agent){
      this.forkAgentWorker(address => forkWorker(address));
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