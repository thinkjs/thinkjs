const cluster = require('cluster');
const helper = require('think-helper');

const cpus = require('os').cpus().length;
const debug = require('debug')('think-cluster');
const WORKER_REALOD = Symbol('worker-reload');
const NEED_KILLED = Symbol('need-killed');

let thinkProcessId = 1;

exports.THINK_RELOAD_SIGNAL = 'think-reload-signal';
exports.THINK_GRACEFUL_FORK = 'think-graceful-fork';
exports.THINK_GRACEFUL_DISCONNECT = 'think-graceful-disconnect';
exports.THINK_STICKY_CLUSTER = 'think-sticky-cluster';
exports.WORKER_REALOD = WORKER_REALOD;
exports.NEED_KILLED = NEED_KILLED;

/**
 * parse options
 */
exports.parseOptions = function(options = {}) {
  options.workers = options.workers || cpus;
  return options;
};
/**
 * check worker is alive
 */
exports.isAliveWorker = worker => {
  const state = worker.state;
  if (state === 'disconnected' || state === 'dead') return false;
  if (worker[NEED_KILLED] || worker[WORKER_REALOD]) return false;
  return true;
};
/**
 * get alive workers
 */
exports.getAliveWorkers = () => {
  const workers = [];
  for (const id in cluster.workers) {
    const worker = cluster.workers[id];
    if (!exports.isAliveWorker(worker)) continue;
    workers.push(worker);
  }
  return workers;
};

/**
 * fork worker
 */
exports.forkWorker = function(env = {}) {
  const deferred = helper.defer();
  env.THINK_PROCESS_ID = thinkProcessId++;
  const worker = cluster.fork(env);
  worker.on('message', message => {
    if (worker[WORKER_REALOD]) return;
    if (message === exports.THINK_GRACEFUL_DISCONNECT) {
      debug(`refork worker, receive message 'think-graceful-disconnect'`);
      worker[WORKER_REALOD] = true;
      exports.forkWorker(env).then(() => worker.send(exports.THINK_GRACEFUL_FORK));
    }
  });
  worker.once('disconnect', () => {
    if (worker[WORKER_REALOD]) return;
    debug(`worker disconnect`);
    worker[WORKER_REALOD] = true;
    exports.forkWorker(env);
  });
  worker.once('exit', (code, signal) => {
    if (worker[WORKER_REALOD]) return;
    debug(`worker exit, code:${code}, signal:${signal}`);
    worker[WORKER_REALOD] = true;
    exports.forkWorker(env);
  });
  worker.once('listening', address => {
    // add prev pid to process.env
    env.THINK_PREV_PID = worker.process.pid;
    deferred.resolve({worker, address});
  });
  return deferred.promise;
};
