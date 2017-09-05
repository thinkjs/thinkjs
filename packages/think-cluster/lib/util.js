const cluster = require('cluster');
const util = require('./util.js');
const helper = require('think-helper');

const cpus = require('os').cpus().length;
const debug = require('debug')('think-cluster');

let thinkProcessId = 1;

exports.THINK_RELOAD_SIGNAL = 'think-reload-signal';
exports.THINK_GRACEFUL_FORK = 'think-graceful-fork';
exports.THINK_GRACEFUL_DISCONNECT = 'think-graceful-disconnect';
exports.THINK_STICKY_CLUSTER = 'think-sticky-cluster';

/**
 * check worker is first
 */
exports.isFirstWorker = function() {
  return +process.env.THINK_PROCESS_ID === 1;
};

/**
 * parse options
 */
exports.parseOptions = function(options = {}) {
  options.workers = options.workers || cpus;
  return options;
};

/**
 * fork worker
 */
exports.forkWorker = function(env = {}) {
  const deferred = helper.defer();
  env.THINK_PROCESS_ID = thinkProcessId++;
  const worker = cluster.fork(env);
  worker.on('message', message => {
    if (worker.hasGracefulReload) return;
    if (message === exports.THINK_GRACEFUL_DISCONNECT) {
      debug(`refork worker, receive message 'think-graceful-disconnect'`);
      worker.hasGracefulReload = true;
      exports.forkWorker(env).then(() => {
        worker.send(util.THINK_GRACEFUL_FORK);
      });
    }
  });
  worker.once('exit', (code, signal) => {
    if (worker.hasGracefulReload) return;
    debug(`worker exit, code:${code}, signal:${signal}`);
    exports.forkWorker(env);
  });
  worker.once('listening', address => {
    deferred.resolve({worker, address});
  });
  return deferred.promise;
};
