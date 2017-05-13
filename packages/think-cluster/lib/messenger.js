const cluster = require('cluster');
const helper = require('think-helper');
const events = require('events');

const isMaster = cluster.isMaster;
const MessengerInit = Symbol('think-messenger-init');
const MESSENGER = 'think-messenger';

let taskId = 1;

/**
 * Messenger class
 */
class Messenger extends events {
  constructor(){
    super();
    this.bindEvent();
  }
  /**
   * get workers
   * @param  {String} type []
   * @return {Array}      []
   */
  getWorkers(type = 'all'){
    let workers = [];
    for(let id in cluster.workers){
      let worker = cluster.workers[id];
      switch(type){
        case 'all':
          workers.push(worker);
          break;
        case 'app':
          if(!worker.isAgent) workers.push(worker);
          break;
        case 'agent':
          if(worker.isAgent) workers.push(worker);
          break;
        case 'one':
          if(!workers.length) workers.push(worker);
          break;
      }
    }
    return workers;
  }
  /**
   * bind event
   * @return {} []
   */
  bindEvent(){
    if(process[MessengerInit]) return;
    process[MessengerInit] = true;

    if(cluster.isMaster){
      process.on('message', message => {
        if(message && message.act === MESSENGER){
          let workers = this.getWorkers(message.target);
          workers.forEach(worker => worker.send(message));
        }
      })
    }else{
      process.on('message', message => {
        if(message && message.act === MESSENGER){
          let action = message.action;
          process.emit(action, message.data);
        }
      });
    }
  }
  /**
   * setTimeout
   * @param {Number} timeout []
   */
  setTimeout(actionName, timeout = 3000){
    setTimeout(() => process.emit(actionName, new Error('timeout')), timeout);
  }
  /**
   * broadcast
   * @param  {String} action []
   * @param  {Mixed} data   []
   * @return {}        []
   */
  broadcast(action, data){
    let id = taskId++;
    let actionName = `think-messenger-${id}`;
    process.send({
      act: MESSENGER, 
      action: actionName, 
      data, 
      target: 'all'
    });
    process.once(actionName, data => {
      if(!helper.isError(data)){
        this.emit(action, data);
      }
    });
    this.setTimeout(actionName);
  }
  /**
   * run in one worker
   * @param  {Function} callback []
   * @return {}            []
   */
  runInOne(callback){
    let id = taskId++;
    let actionName = `think-messenger-${id}`;
    process.send({
      act: MESSENGER, 
      action: actionName,
      target: 'one'
    });
    process.once(actionName, data => {
      if(!helper.isError(data) && callback){
        callback();
      }
    });
    this.setTimeout(actionName);
  }
}

module.exports = Messenger;