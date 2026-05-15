const cluster = require('cluster');
const helper = require('think-helper');
const path = require('path');
const debug = require('debug')(`think-cluster-worker-${process.pid}`);

/**
 * Worker class
 */
class Worker {
  constructor(options = {}) {
    this.options = options;
  }

  getServer() {
    const argv = process.argv;
    const index = argv.indexOf('--port');
    if (index !== -1) {
      const port = parseInt(argv[index + 1]);
      if (port) return port;
    }
    return this.options.port;
  }

  getForkArg(port) {
    const argv = process.argv.slice(2);
    const portIndex = argv.indexOf('--port');
    if (portIndex !== -1) {
      argv[portIndex + 1] = port;
    } else {
      argv.push('--port', port);
    }
    return argv;
  }

  /**
   * capture worker exception
   */
  captureException(callback) {
    let errTimes = 0;
    const maxErrTimes = this.options.maxErrTimes || 1;

    cluster.on('exit', (worker, code, signal) => {
      if (worker.exitedAfterDisconnect) return;
      errTimes++;
      if (errTimes > maxErrTimes) {
        process.exit(1);
      }
      callback && callback(worker, code, signal);
    });
  }

  forkWorker(port, index) {
    const options = this.options;
    const exec = options.exec || process.argv[1];
    const args = this.getForkArg(port || options.port || 0);
    const silent = 'silent' in options ? options.silent : false;
    const env = Object.assign({}, process.env, {
      THINK_WORKER_ID: index
    });
    debug(`fork worker: ${exec} ${args.join(' ')}, THINK_WORKER_ID: ${index}`);
    return cluster.fork(env);
  }

  /**
   * fork workers
   */
  forkWorkers() {
    const options = this.options;
    const numWorkers = options.workers || require('os').cpus().length;
    const port = options.port;
    debug(`fork ${numWorkers} workers`);
    for (let i = 0; i < numWorkers; i++) {
      this.forkWorker(port, i + 1);
    }
    this.captureException(worker => {
      debug(`worker ${worker.process.pid} died, fork new worker`);
      this.forkWorker(port, worker.process.env.THINK_WORKER_ID);
    });
  }

  /**
   * start
   */
  start(callback) {
    const options = this.options;
    if (cluster.isMaster) {
      this.forkWorkers();
    } else {
      const port = this.getServer();
      if (helper.isFunction(callback)) callback(port);
    }
  }
}

module.exports = Worker;
