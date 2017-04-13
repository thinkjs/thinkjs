const cluster = require('cluster');
const util = require('./util.js');

const cpus = require('os').cpus().length;
const debug = require('debug')('think-cluster');

let thinkProcessId = 1;

exports.THINK_RELOAD_SIGNAL = 'think-reload-signal';
exports.THINK_GRACEFUL_FORK = 'think-graceful-fork';
exports.THINK_GRACEFUL_DISCONNECT = 'think-graceful-disconnect';
exports.THINK_AGENT_OPTIONS = 'think-agent-options';
exports.THINK_AGENT_CLOSED = 'think-agent-closed';

exports.PIN = 'PIN';

/**
 * check worker is first
 */
exports.isFirstWorker = function(){
  return +process.env.THINK_PROCESS_ID === 1;
}

/**
 * check is agent worker
 */
exports.isAgent = function(){
  return !!process.env.THINK_AGENT_WORKER;
}
/**
 * enable agent
 */
exports.enableAgent = function(){
  return !! process.env.THINK_ENABLE_AGENT;
}
/**
 * parse options
 */
exports.parseOptions = function(options = {}){
  options.workers = options.workers || cpus;
  if(options.workers < 2){
    options.enableAgent = false;
  }
  return options;
}

/**
 * fork worker
 */
exports.forkWorker = function(env = {}, callback){
  env.THINK_PROCESS_ID = env.THINK_AGENT_WORKER ? 0 : thinkProcessId++;
  const worker = cluster.fork(env);
  worker.on('message', message => {
    if(message === exports.THINK_GRACEFUL_DISCONNECT){
      debug(`refork worker, receive message 'think-graceful-disconnect', pid: ${process.pid}`);
      worker.hasGracefulReload = true;
      exports.forkWorker(env, () => {
        worker.send(exports.THINK_GRACEFUL_FORK);
      });
    }
  });
  worker.once('exit', (code, signal) => {
    debug(`worker exit, code:${code}, signal:${signal}, pid: ${process.pid}`);
    if(worker.hasGracefulReload) return;
    exports.forkWorker(env);
  });
  worker.once('listening', address => {
    if(worker.isAgent){
      debug(`agent worker is listening, address:${JSON.stringify(address)}`);
      //send agent server address to workers
      for(let id in cluster.workers){
        let item = cluster.workers[id];
        if(item.isAgent) continue;
        item.send({act: util.THINK_AGENT_OPTIONS, address});
      }
    }
    callback && callback(worker, address);
  });
  return worker;
}
