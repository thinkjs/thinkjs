const cluster = require('cluster');
const helper = require('think-helper');

/**
 * Master class
 */
class Master {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * fork worker
   */
  forkWorker() {
    const worker = cluster.fork();
    debug(`fork worker ${worker.process.pid}`);
    return worker;
  }

  /**
   * start master
   */
  start() {
    if (!cluster.isMaster) return;
    return Promise.resolve();
  }
}

module.exports = Master;
