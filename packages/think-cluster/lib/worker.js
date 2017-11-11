const util = require('./util.js');
const cluster = require('cluster');
const helper = require('think-helper');
const debug = require('debug')('think-cluster');
const KEEP_ALIVE = Symbol('think-graceful-keepalive');
const WORKER_RELOAD = Symbol('worker-reload');

/**
 * default options
 */
const defaultOptions = {
  port: 0,
  host: '',
  sticky: false,
  createServer: () => {},
  logger: () => {},
  onUncaughtException: () => true, // onUncaughtException event handle
  onUnhandledRejection: () => true, // onUnhandledRejection event handle
  processKillTimeout: 10 * 1000 // 10s
};
/**
 * Worker
 */
class Worker {
  /**
   * constructor
   * @param {Object} options
   */
  constructor(options) {
    options = util.parseOptions(options);
    this.options = Object.assign({}, defaultOptions, options);
  }
  /**
   * disable keep alive
   */
  disableKeepAlive() {
    if (this[KEEP_ALIVE]) return;
    this[KEEP_ALIVE] = true;
    this.server.on('request', (req, res) => {
      req.shouldKeepAlive = false;
      res.shouldKeepAlive = false;
      if (!res.headersSent) {
        res.setHeader('Connection', 'close');
      }
    });
  }
  /**
   * close server
   */
  closeServer() {
    this.disableKeepAlive();
    const killTimeout = this.options.processKillTimeout;
    if (killTimeout) {
      const timer = setTimeout(() => {
        debug(`process exit by killed(timeout: ${killTimeout}ms), pid: ${process.pid}`);
        process.exit(1);
      }, killTimeout);
      timer.unref && timer.unref();
    }
    const worker = cluster.worker;
    debug(`start close server, pid: ${process.pid}`);
    this.server.close(() => {
      debug(`server closed, pid: ${process.pid}`);
      try {
        worker.disconnect();
      } catch (e) {
        debug(`already disconnect, pid:${process.pid}`);
      }
    });
  }
  /**
   * disconnect worker
   * @param {Boolean} sendSignal
   */
  disconnectWorker(sendSignal) {
    const worker = cluster.worker;
    // if worker has diconnect, return directly
    if (worker[WORKER_RELOAD]) return;
    worker[WORKER_RELOAD] = true;

    if (sendSignal) {
      worker.send(util.THINK_GRACEFUL_DISCONNECT);
      worker.once('message', message => {
        if (message === util.THINK_GRACEFUL_FORK) {
          this.closeServer();
        }
      });
    } else {
      this.closeServer();
    }
  }
  /**
   * capture reload signal
   */
  captureReloadSignal() {
    process.on('message', message => {
      if (message === util.THINK_RELOAD_SIGNAL) {
        this.disconnectWorker(true);
      }
    });
  }
  /**
   * uncaughtException
   */
  uncaughtException() {
    let errTimes = 0;
    process.on('uncaughtException', err => {
      errTimes++;
      this.options.logger(`uncaughtException, times: ${errTimes}, pid: ${process.pid}`);
      this.options.logger(err);

      const flag = this.options.onUncaughtException(err);
      if (errTimes === 1 && flag) {
        this.disconnectWorker(true);
      }
    });
  }
  /**
   * unhandledRejection
   */
  unhandledRejection() {
    let rejectTimes = 0;
    process.on('unhandledRejection', err => {
      rejectTimes++;
      this.options.logger(`unhandledRejection, times: ${rejectTimes}, pid: ${process.pid}`);
      this.options.logger(err);
      const flag = this.options.onUnhandledRejection(err);
      if (rejectTimes === 1 && flag) {
        this.disconnectWorker(true);
      }
    });
  }
  /**
   * listen port
   */
  listen() {
    const deferred = helper.defer();
    this.server = this.options.createServer();
    if (!this.options.sticky) {
      this.server.listen(this.options.port, this.options.host, () => {
        deferred.resolve();
      });
    } else {
      process.on('message', (message, socket) => {
        if (message !== util.THINK_STICKY_CLUSTER) return;
        // emulate a connection event on the server by emitting the
        // event with the connection master sent to us
        this.server.emit('connection', socket);
        // resume as we already catched the conn
        socket.resume();
      });
      // start on random port, accept conn from this host only
      this.server.listen(0, '127.0.0.1', () => {
        deferred.resolve();
      });
    }
    return deferred.promise;
  }
  /**
   * capture events
   */
  captureEvents() {
    this.uncaughtException();
    this.unhandledRejection();
    this.captureReloadSignal();
  }
  /**
   * start server
   */
  startServer() {
    this.captureEvents();
    return this.listen();
  }
  /**
   * get workers
   */
  getWorkers() {
    return process.env.THINK_WORKERS;
  }
}

module.exports = Worker;
