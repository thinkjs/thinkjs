const assert = require('assert');
const cluster = require('cluster');
const cpus = require('os').cpus().length;

const KEEP_ALIVE = Symbol('think@graceful:keepalive');
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
 * think process id
 */
let thinkProcessId = 1;
/**
 * Graceful class
 */
module.exports = class Graceful {
  /**
   * 
   * @param {Object} options 
   */
  constructor(options){
    this.options = options || {};
    for(let key in defaultOptions){
      if(!this.options[key]){
        this.options[key] = defaultOptions[key];
      }
    }
  }
  /**
   * fork worker
   */
  forkWorker(env = {}, callback){
    env.THINK_PROCESS_ID = thinkProcessId++;
    const worker = cluster.fork(env);
    worker.once('message', message => {
      if(message === 'think-graceful-disconnect'){
        this.options.logger(`refork worker, receive message 'think-graceful-disconnect', pid: ${process.pid}`);
        env.THINK_FIRST_WORKER = 0; 
        this.forkWorker(env, () => {
          worker.send('think-graceful-fork');
        });
      }
    });
    if(callback){
      worker.once('listening', () => {
        callback();
      });
    }
    return worker;
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
      worker.send('think-graceful-disconnect');
      worker.once('message', message => {
        if(message === 'think-graceful-fork'){
          this.closeServer();
        }
      });
    }else{
      this.closeServer();
    }
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
   * capture reload signal
   */
  captureReloadSignal(){
    if(cluster.isMaster){
      const signal = this.options.reloadSignal;
      process.on(signal, () => {
        for(let id in cluster.workers){
          let worker = cluster.workers[id];
          worker.send('think-reload-signal');
        }
      });
    }else{
      process.once('message', message => {
        if(message === 'think-reload-signal'){
          this.disconnectWorker(true);
        }
      });
    }
  }
  /**
   * for master
   */
  master(){
    assert(cluster.isMaster, 'only invoke in master process');
    let workers = this.options.workers || cpus;
    let index = 0;
    while(index++ < workers){
      this.forkWorker({
        THINK_FIRST_WORKER: index === 1 ? 1 : 0,
        THINK_WORKERS: workers
      });
    }
    if(this.options.reloadSignal){
      this.captureReloadSignal();
    }
  }
  /**
   * check worker is first
   */
  isFirstWorker(){
    return process.env.THINK_FIRST_WORKER === '1';
  }
  /**
   * force reload all workers, in development env
   */
  forceReloadWorkers(){
    assert(cluster.isMaster, 'only invoke in master process');
    let firstWorker, aliveWorkers = [];
    for(let id in cluster.workers){
      let worker = cluster.workers[id];
      if(worker.state === 'disconnected'){
        continue;
      }
      if(!firstWorker){
        firstWorker = worker;
      }else{
        aliveWorkers.push(worker);
      }
    }
    const worker = this.forkWorker();
    //http://man7.org/linux/man-pages/man7/signal.7.html
    worker.once('listening', () => {
      if(firstWorker){
        firstWorker.kill('SIGQUIT');
        setTimeout(function () {
          firstWorker.process.kill('SIGQUIT');
        }, 100);
      }
    });
    aliveWorkers.forEach(worker => {
      worker.kill('SIGQUIT');
      this.forkWorker();
    });
  }
  /**
   * for worker
   */
  worker(){
    assert(cluster.isWorker, 'only invoke in worker process');
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
}