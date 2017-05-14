const cluster = require('cluster');
const util = require('./util.js');
const helper = require('think-helper');
//const debug = require('debug')('think-cluster');

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
  forkAgentWorker(){
    return util.forkWorker({
      THINK_AGENT_WORKER: 1
    });
  }
  /**
   * fork workers
   */
  forkWorkers(){
    const forkWorker = (env = {}, address) => {
      let workers = this.options.workers;
      let index = 0;
      let promises = [];
      while(index++ < workers){
        env = Object.assign(env, this.getForkEnv());
        let promise = util.forkWorker(env).then(data => {
          if(address){
            data.worker.send({act: util.THINK_AGENT_OPTIONS, address});
          }
        });
        promises.push(promise);
      }
      return Promise.all(promises);
    }
    if(this.options.reloadSignal){
      this.captureReloadSignal();
    }
    if(this.options.enableAgent){
      return this.forkAgentWorker().then(data => {
        return forkWorker({THINK_ENABLE_AGENT: 1}, data.address);
      });
    }
    return forkWorker();
  }
  /**
   * kill worker
   */
  killWorker(worker){
    worker.kill('SIGQUIT');
    setTimeout(function () {
      worker.process.kill('SIGQUIT');
    }, 100);
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
    util.forkWorker(this.getForkEnv()).then(() => {
      //http://man7.org/linux/man-pages/man7/signal.7.html
      this.killWorker(firstWorker);
      aliveWorkers.forEach(worker => {
        this.killWorker(worker);
        return util.forkWorker(this.getForkEnv());
      });
    });
  }
}

module.exports = Master;