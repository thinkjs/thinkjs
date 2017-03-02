const assert = require('assert');
const cluster = require('cluster');
const cpus = require('os').cpus().length;

const defaultOptions = {
  logger: console,
  onError: () => {},
  killTimeout: 30 * 1000
};
/**
 * disconnect worker
 */
const disconnectWorker = options => {
  const server = options.server;
  server.on('request', (req, res) => {
    req.shouldKeepAlive = false;
    res.shouldKeepAlive = false;
    if (!res.headersSent) {
      res.setHeader('Connection', 'close');
    }
  });
  const logger = options.logger;

  const killTimeout = options.killTimeout;
  if(killTimeout){
    const timer = setTimeout(() => {
      logger.error(`process exit by killed(timeout: ${killTimeout}ms), pid: ${process.pid}`);
      process.exit(1);
    }, killTimeout);
    timer.unref();
  }
  
  const worker = cluster.worker;
  worker.on('disconnect', () => {
    logger.error(`process exit by disconnect event, pid: ${process.pid}`);
    process.exit(0);
  });

  worker.send('think-graceful-disconnect');
  logger.error(`start close server, pid: ${process.pid}, connections: ${server._connections}`);
  server.close(() => {
    logger.error(`server closed, pid: ${process.pid}`);
    worker.disconnect();
  });
}

/**
 * fork worker
 */
const forkWorker = options => {
  const worker = cluster.fork();
  worker.on('message', message => {
    if(message === 'think-graceful-disconnect'){
      options.logger.error(`refork worker, receive message 'think-graceful-disconnect', pid: ${process.pid}`);
      forkWorker(options);
    }
  });
}

module.exports = (options = {}) => {
  options = Object.assign({}, defaultOptions, options);
  if(cluster.isMaster){
    let workers = options.workers || cpus;
    let index = 0;
    while(index++ < workers){
      forkWorker(options);
    }
  }else{
    assert(options.server, 'options.server required');
    let errTimes = 0;
    process.on('uncaughtException', err => {
      errTimes++;
      options.onError(err);
      options.logger.error(`uncaughtException, times: ${errTimes}, pid: ${process.pid}`)
      options.logger.error(err.stack);
      if(errTimes === 1){
        disconnectWorker(options);
      }
    });
  }
}