const util = require('./util.js');
const cluster = require('cluster');
const assert = require('assert');

const KEEP_ALIVE = Symbol('think-graceful-keepalive');

/**
 * default options
 */
const defaultOptions = {
  logger: console.error.bind(console),
  disableKeepAlive: false, //disabled connect keep alive
  onUncaughtException: () => {},
  onUnhandledRejection: () => {},
  processKillTimeout: 10 * 1000 //10s
};
/**
 * Worker
 */
class Worker {
  /**
   * constructor
   * @param {Object} options 
   */
  constructor(options){
    options = util.parseOptions(options);
    this.options = Object.assign({}, defaultOptions, options);
  }
  /**
   * disable keep alive
   */
  disableKeepAlive(){
    if(this[KEEP_ALIVE]) return;
    this[KEEP_ALIVE] = true;
    const server = this.options.server;
    server.on('request', (req, res) => {
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
  closeServer(){
    this.disableKeepAlive();
    const logger = this.options.logger;

    const killTimeout = this.options.processKillTimeout;
    if(killTimeout){
      const timer = setTimeout(() => {
        logger(`process exit by killed(timeout: ${killTimeout}ms), pid: ${process.pid}`);
        process.exit(1);
      }, killTimeout);
      timer.unref();
    }
    const worker = cluster.worker;
    worker.on('disconnect', () => {
      logger(`process exit by disconnect event, pid: ${process.pid}`);
      process.exit(0);
    });
    
    const server = this.options.server;
    logger(`start close server, pid: ${process.pid}, connections: ${server._connections}`);
    server.close(() => {
      logger(`server closed, pid: ${process.pid}`);
      worker.disconnect();
    });
  }
  /**
   * disconnect worker
   * @param {Boolean} sendSignal 
   */
  disconnectWorker(sendSignal){
    const worker = cluster.worker;
    if(sendSignal){
      worker.send(util.THINK_GRACEFUL_DISCONNECT);
      worker.once('message', message => {
        if(message === util.THINK_GRACEFUL_FORK){
          this.closeServer();
        }
      });
    }else{
      this.closeServer();
    }
  }
  /**
   * capture reload signal
   */
  captureReloadSignal(){
    process.once('message', message => {
      if(message === 'think-reload-signal'){
        this.disconnectWorker(true);
      }
    });
  }
  /**
   * uncaughtException
   */
  uncaughtException(){
    let errTimes = 0;
    process.on('uncaughtException', err => {
      errTimes++;
      this.options.onUncaughtException(err);
      this.options.logger(`uncaughtException, times: ${errTimes}, pid: ${process.pid}`);
      this.options.logger(err.stack);
      if(errTimes === 1){
        this.disconnectWorker(true);
      }
    });
  }
  /**
   * unhandledRejection
   */
  unhandledRejection(){
    let rejectTimes = 0;
    process.on('unhandledRejection', err => {
      rejectTimes++;
      this.options.onUnhandledRejection(err);
      this.options.logger(`unhandledRejection, times: ${rejectTimes}, pid: ${process.pid}`);
    });
  }
  /**
   * capture SIGINT
   */
  captureSigint(){
    process.on('SIGINT', () => {
      this.options.logger(`process recieve SIGINT, pid:${process.pid}`);
      this.disconnectWorker();
    });
  }
  /**
   * capture events
   */
  captureEvents(){
    assert(this.options.server, 'options.server required');
    this.uncaughtException();
    this.unhandledRejection();
    if(this.options.captureSigint){
      this.captureSigint();
    }
    if(this.options.disableKeepAlive){
      this.disableKeepAlive();
    }
    this.captureReloadSignal();
  }
  /**
   * get workers
   */
  getWorkers(){
    return process.env.THINK_WORKERS;
  }
}

module.exports = Worker;