const assert = require('assert');
const cluster = require('cluster');
const cpus = require('os').cpus().length;

/**
 * default options
 */
const defaultOptions = {
  logger: console.error.bind(console),
  onUncaughtException: () => {},
  onUnhandledRejection: () => {},
  killTimeout: 10 * 1000 //10s
};

/**
 * Graceful class
 */
module.exports = class Graceful {
  /**
   * 
   * @param {Object} options 
   */
  constructor(options){
    this.options = Object.assign({}, defaultOptions, options);
  }
  /**
   * fork worker
   */
  forkWorker(){
    const worker = cluster.fork();
    worker.on('message', message => {
      if(message === 'think-graceful-disconnect'){
        this.options.logger(`refork worker, receive message 'think-graceful-disconnect', pid: ${process.pid}`);
        this.forkWorker();
      }
    });
  }
  /**
   * disconnect worker
   * @param {Boolean} sendSignal 
   */
  disconnectWorker(sendSignal){
    const server = this.options.server;
    server.on('request', (req, res) => {
      req.shouldKeepAlive = false;
      res.shouldKeepAlive = false;
      if (!res.headersSent) {
        res.setHeader('Connection', 'close');
      }
    });
    const logger = this.options.logger;

    const killTimeout = this.options.killTimeout;
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

    if(sendSignal){
      worker.send('think-graceful-disconnect');
    }
    
    logger(`start close server, pid: ${process.pid}, connections: ${server._connections}`);
    server.close(() => {
      logger(`server closed, pid: ${process.pid}`);
      worker.disconnect();
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
   * SIGINT
   */
  sigint(){
    process.on('SIGINT', () => {
      this.options.logger(`process recieve SIGINT, pid:${process.pid}`);
      this.disconnectWorker();
    });
  }
  /**
   * for master
   */
  master(){
    assert(cluster.isMaster, 'only invoke in master process');
    let workers = this.options.workers || cpus;
    let index = 0;
    while(index++ < workers){
      this.forkWorker();
    }
  }
  /**
   * for worker
   */
  worker(){
    assert(cluster.isWorker, 'only invoke in worker process');
    assert(this.options.server, 'options.server required');
    this.uncaughtException();
    this.unhandledRejection();
    if(this.options.sigint){
      this.sigint();
    }
  }
}