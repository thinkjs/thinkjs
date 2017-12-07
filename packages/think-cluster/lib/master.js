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
      util.getAliveWorkers().forEach(worker => worker.send(util.THINK_RELOAD_SIGNAL));
    };
    if (signal) process.on(signal, reloadWorkers);

    // if receive message `think-cluster-reload-workers` from worker, restart all workers
    cluster.on('message', (worker, message) => {
      if (message !== 'think-cluster-reload-workers') return;
      reloadWorkers();
    });
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
   * fork workers
   */
  forkWorkers() {
    this.captureReloadSignal();
    const workers = this.options.workers;
    let index = 0;
    const promises = [];
    while (index++ < workers) {
      const env = Object.assign({}, this.getForkEnv());
      const promise = util.forkWorker(env);
      promises.push(promise);
    }
    return Promise.all(promises);
  }
  /**
   * kill worker
   */
  killWorker(worker, reload) {
    if (reload) worker[util.WORKER_REALOD] = true;
    worker.kill('SIGINT'); // windows don't support SIGQUIT
    worker[util.NEED_KILLED] = true;
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

    const aliveWorkers = util.getAliveWorkers();
    if (!aliveWorkers.length) return;

    // check alive workers has leak
    const allowWorkers = this.options.workers;
    if (aliveWorkers.length > allowWorkers) {
      console.error(`workers fork has leak, alive workers: ${aliveWorkers.length}, need workers: ${this.options.workers}`);
    }

    const firstWorker = aliveWorkers.shift();
    const promise = util.forkWorker(this.getForkEnv()).then(data => {
      this.sendInspectPort(data.worker);
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
      util.getAliveWorkers().some(worker => {
        if (index === ++idx) {
          worker.send(util.THINK_STICKY_CLUSTER, socket);
          return true;
        }
      });
    });
    server.listen(this.options.port, this.options.host, () => {
      this.forkWorkers().then(data => {
        deferred.resolve(data);
      });
    });
    return deferred.promise;
  }
  /**
   * send inspect port
   * @param {Worker} worker
   */
  sendInspectPort(worker) {
    if (!process.send) return;
    const inspect = process.execArgv.some(item => item.indexOf('--inspect') >= 0);
    if (!inspect) return;
    const spawnargs = worker.process.spawnargs;
    let port;
    spawnargs.some(item => {
      let match;
      if (item.indexOf('--inspect') >= 0 && (match = item.match(/\d+/))) {
        port = match[0];
      }
    });
    if (port) {
      process.send({act: 'inspectPort', port});
    }
  }
  /**
   * start server, support sticky
   */
  startServer() {
    const promise = !this.options.sticky ? this.forkWorkers() : this.createServer();
    return promise.then(data => {
      this.sendInspectPort(data[0].worker);
      return data;
    });
  }
}

module.exports = Master;
