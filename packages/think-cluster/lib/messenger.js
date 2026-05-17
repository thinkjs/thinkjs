const cluster = require('cluster');
const helper = require('think-helper');
const events = require('events');
const util = require('./util.js');
const assert = require('assert');

const BIND_EVENT = Symbol('bind-event');
const MESSENGER = 'think-messenger';
const mapPromise = new Map();

// task counter
let count = 0;

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
    if (process[BIND_EVENT]) return;
    process[BIND_EVENT] = true;
    if (cluster.isMaster) {
      cluster.on('message', (worker, message) => {
        if (!message || message.act !== MESSENGER) return;
        const workers = this.getWorkers(message.target, worker);
        if (message.map) {
          if (message.mapReturn) {
            const map = mapPromise.get(`${message.action}_${message.taskId}`);
            map.get(worker).resolve(message.data);
          } else {
            const map = new Map();
            mapPromise.set(`${message.action}_${message.taskId}`, map);
            const promises = workers.map(worker => {
              worker.send(message);
              const defer = helper.defer();
              map.set(worker, defer);
              return defer.promise;
            });
            Promise.all(promises).then(data => {
              message.data = data;
              message.action = `${message.action}_${message.taskId}_ret`;
              worker.send(message);
            });
          }
        } else {
          workers.forEach(worker => worker.send(message));
        }
      });
    } else {
      process.on('message', message => {
        if (!message || message.act !== MESSENGER) return;
        if (message.map && (typeof message.data === 'undefined')) {
          const listener = this.listeners(message.action)[0];
          assert(helper.isFunction(listener), `${message.action} listener must be a function`);
          Promise.resolve(listener(message.mapData)).then(data => {
            delete message.mapData;
            message.data = data;
            message.mapReturn = true;
            process.send(message);
          });
        } else {
          this.emit(message.action, message.data);
        }
      });
    }
  }
  /**
   * broadcast
   * @param  {String} action []
   * @param  {Mixed} data   []
   * @return {}        []
   */
  broadcast(action, data) {
    assert(this.listenerCount(action) > 0, `can not find \`${action}\` listeners`);
    process.send({
      act: MESSENGER,
      action,
      data,
      target: 'all'
    });
  }
  /**
   * map worker task, return worker exec result
   * @param {String} action
   */
  map(action, mapData) {
    const defer = helper.defer();
    count = count % Number.MAX_SAFE_INTEGER + 1;
    const taskId = count + '' + process.pid;
    process.send({
      act: MESSENGER,
      action,
      taskId,
      mapData,
      map: true,
      target: 'all'
    });
    this.once(`${action}_${taskId}_ret`, data => {
      defer.resolve(data);
      mapPromise.delete(action);
    });
    return defer.promise;
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
  consume(action, data) {
    if (helper.isFunction(action)) {
      const callback = action;
      count = count % Number.MAX_SAFE_INTEGER + 1;
      const taskId = count + '' + process.pid;
      action = `think-messenger-${taskId}`;
      this.once(action, callback);
      // remove event callback after timeout, avoid memory leak
      helper.timeout(10000).then(() => this.removeAllListeners(action));
    } else {
      assert(this.listenerCount(action) > 0, `can not find \`${action}\` listeners`);
    }
    process.send({
      act: MESSENGER,
      action,
      data,
      target: 'one'
    });
  }
}

module.exports = Messenger;
