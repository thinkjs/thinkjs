const cluster = require('cluster');
const helper = require('think-helper');
const events = require('events');
const util = require('./util.js');
const assert = require('assert');

const MESSENGER = 'think-messenger';

let taskId = 1;

/**
 * Messenger class
 */
class Messenger extends events {
  constructor() {
    super();
    this.bindEvent();
  }
  /**
   * get workers
   * @param  {String} type []
   * @return {Array}      []
   */
  getWorkers(type = 'all', cWorker) {
    const aliveWorkers = util.getAliveWorkers();
    if (type === 'all') return aliveWorkers;
    if (type === 'one') {
      if (!aliveWorkers.length || aliveWorkers[0] !== cWorker) return [];
      return [aliveWorkers[0]];
    }
  }
  /**
   * bind event
   * @return {} []
   */
  bindEvent() {
    if (cluster.isMaster) {
      cluster.on('message', (worker, message) => {
        if (message && message.act === MESSENGER) {
          const workers = this.getWorkers(message.target, worker);
          workers.forEach(worker => worker.send(message));
        }
      });
    } else {
      process.on('message', message => {
        if (message && message.act === MESSENGER) {
          this.emit(message.action, message.data);
        }
      });
    }
  }
  /**
   * setTimeout
   * @param {Number} timeout []
   */
  setTimeout(actionName, timeout = 3000) {
    setTimeout(() => this.emit(actionName, new Error('timeout')), timeout);
  }
  /**
   * broadcast
   * @param  {String} action []
   * @param  {Mixed} data   []
   * @return {}        []
   */
  broadcast(action, data) {
    process.send({
      act: MESSENGER,
      action,
      data,
      target: 'all'
    });
  }
  /**
   * 
   * @param {String} action 
   * @param {Function} callback 
   */
  map(action, callback) {

  }
  /**
   * this method will be deprecated
   * @param {Function} callback 
   */
  runInOne(callback) {
    return this.consume(callback);
  }
  /**
   * run in one worker
   * @param  {Function} callback []
   * @return {}            []
   */
  consume(callback) {
    assert(helper.isFunction(callback), 'callback must be a function');
    const action = `think-messenger-${taskId++}`;
    process.send({
      act: MESSENGER,
      action,
      target: 'one'
    });
    this.once(action, data => {
      if (!helper.isError(data)) {
        callback();
      }
    });
    this.setTimeout(action);
  }
}

module.exports = Messenger;
