const cluster = require('cluster');
const util = require('./util.js');
const net = require('net');
const stringHash = require('string-hash');

let waitReloadWorkerTimes = 0;

/**
 * default options
 */
const defaultOptions = {
  port: 0, // server listen port
  host: '', // server listen host
  sticky: false, // sticky cluster
  getRemoteAddress: socket => socket.remoteAddress,
  workers: 0, // fork worker nums
  reloadSignal: '' // reload workers signal
};

/**
 * Master class
 */
class Master {
  /**
   * constructor
   * @param {Object} options 
   */
  constructor(options) {
    options = util.parseOptions(options);
    this.options = Object.assign({}, defaultOptions, options);
  }
  /**
   * capture reload signal
   */
  captureReloadSignal() {
    const signal = this.options.reloadSignal;
    const reloadWorkers = () => {
      for (const id in cluster.workers) {
        const worker = cluster.workers[id];
        if (!this.isAliveWorker(worker) || util.isAgent(worker)) continue;
        worker.send(util.THINK_RELOAD_SIGNAL);
      }
    };
    if (signal) process.on(signal, reloadWorkers);

    // if receive message `think-cluster-reload-workers` from worker, restart all workers
    cluster.on('message', (worker, message) => {
      if (message !== 'think-cluster-reload-workers') return;
      reloadWorkers();
    });
  }
  /**
   * check worker is alive
   * @param {Object} worker 
   */
  isAliveWorker(worker) {
    const state = worker.state;
    if (state === 'disconnected' || state === 'dead' || worker.needKilled) {
      return false;
    }
    return true;
  }
  /**
   * get fork env
   */
  getForkEnv() {
    return {
      THINK_WORKERS: this.options.workers // workers num
    };
  }
  /**
   * fork agent worker
   */
  forkAgentWorker() {
    return util.forkWorker({
      THINK_AGENT_WORKER: 1
    });
  }
  /**
   * fork workers
   */
  forkWorkers() {
    const forkWorker = (env = {}, address) => {
      const workers = this.options.workers;
      let index = 0;
      const promises = [];
      while (index++ < workers) {
        env = Object.assign(env, this.getForkEnv());
        const promise = util.forkWorker(env).then(data => {
          if (address) {
            data.worker.send({act: util.THINK_AGENT_OPTIONS, address});
          }
        });
        promises.push(promise);
      }
      return Promise.all(promises);
    };
    this.captureReloadSignal();
    if (this.options.enableAgent) {
      return this.forkAgentWorker().then(data => {
        return forkWorker({THINK_ENABLE_AGENT: 1}, data.address);
      });
    }
    return forkWorker();
  }
  /**
   * kill worker
   */
  killWorker(worker, reload) {
    if (reload) worker.hasGracefulReload = true;
    worker.kill('SIGINT'); // windows don't support SIGQUIT
    worker.needKilled = true;
    setTimeout(function() {
      if (!worker.isConnected()) return;
      worker.process.kill('SIGINT');
    }, 100);
  }
  /**
   * force reload all workers when code is changed, in development env
   */
  forceReloadWorkers() {
    if (waitReloadWorkerTimes) {
      waitReloadWorkerTimes++;
      return;
    }
    waitReloadWorkerTimes = 1;

    const aliveWorkers = [];
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (!this.isAliveWorker(worker)) continue;
      aliveWorkers.push(worker);
    }
    if (!aliveWorkers.length) return;

    // check alive workers has leak
    let allowWorkers = this.options.workers;
    if (this.options.enableAgent) allowWorkers++;
    if (aliveWorkers.length > allowWorkers) {
      console.error(`workers fork has leak, alive workers: ${aliveWorkers.length}, need workers: ${this.options.workers}`);
    }

    const firstWorker = aliveWorkers.shift();
    const promise = util.forkWorker(this.getForkEnv()).then(() => {
      // http://man7.org/linux/man-pages/man7/signal.7.html
      this.killWorker(firstWorker, true);
      return aliveWorkers.map(worker => {
        this.killWorker(worker, true);
        return util.forkWorker(this.getForkEnv());
      });
    });
    return promise.then(() => {
      if (waitReloadWorkerTimes > 1) {
        waitReloadWorkerTimes = 0;
        this.forceReloadWorkers();
      } else {
        waitReloadWorkerTimes = 0;
      }
    });
  }
  /**
   * create server with sticky
   * https://github.com/uqee/sticky-cluster
   */
  createServer() {
    const deferred = think.defer();
    const server = net.createServer({pauseOnConnect: true}, socket => {
      const remoteAddress = this.options.getRemoteAddress(socket) || '';
      const index = stringHash(remoteAddress) % this.options.workers;
      let idx = -1;
      for (const id in cluster.workers) {
        const worker = cluster.workers[id];
        if (!this.isAliveWorker(worker) || util.isAgent(worker)) continue;
        if (index === ++idx) {
          worker.send(util.THINK_STICKY_CLUSTER, socket);
          break;
        }
      }
    });
    server.listen(this.options.port, this.options.host, () => {
      this.forkWorkers().then(() => {
        deferred.resolve();
      });
    });
    return deferred.promise;
  }
  /**
   * start server, support sticky
   */
  startServer() {
    if (!this.options.sticky) return this.forkWorkers();
    return this.createServer();
  }
}

module.exports = Master;
