const cluster = require('cluster');
const cpus = require('os').cpus().length;

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
  return process.env.THINK_FIRST_WORKER === '1';
}

/**
 * check is agent worker
 */
exports.isAgent = function(){
  return !!process.env.THINK_AGENT_WORKER;
}

/**
 * can delegate
 */
exports.canDelegate = function(){
  return !!exports.getAgentConnectOptions();
}

/**
 * get agent connect options
 */
let connectOptions = null;
exports.getAgentConnectOptions = function(){
  if(connectOptions) return connectOptions;
  let options = process.env.THINK_AGENT_OPTIONS;
  if(!options) return false;
  try{
    connectOptions = JSON.parse(options);
    return connectOptions;
  }catch(e){
    return false;
  }
}

/**
 * parse options
 */
exports.parseOptions = function(options = {}){
  options.workers = options.workers || cpus;
  options.agent = true;
  options.delegate = !!options.delegate;
  if(options.workers < 2){
    options.delegate = false;
    options.agent = false;
  }
  if(cluster.isWorker && !exports.isAgent()){
    if(!exports.getAgentConnectOptions()){
      options.delegate = false;
      options.agent = false;
    }
  }
  return options;
}

/**
 * fork worker
 */
exports.forkWorker = function(env = {}, logger, callback){
  env.THINK_PROCESS_ID = thinkProcessId++;
  const worker = cluster.fork(env);
  worker.once('message', message => {
    if(message === exports.THINK_GRACEFUL_DISCONNECT){
      logger(`refork worker, receive message 'think-graceful-disconnect', pid: ${process.pid}`);
      env.THINK_FIRST_WORKER = 0; 
      exports.forkWorker(env, () => {
        worker.send(exports.THINK_GRACEFUL_FORK);
      });
    }
  });
  worker.once('exit', (code, signal) => {

  });
  if(callback){
    worker.once('listening', () => {
      callback(worker);
    });
  }
  return worker;
}
