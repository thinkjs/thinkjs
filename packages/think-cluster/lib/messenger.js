const cluster = require('cluster');
const helper = require('think-helper');
const events = require('events');

const MessengerInit = Symbol('think-messenger-init');
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
    const workers = [];
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      switch (type) {
        case 'all':
          workers.push(worker);
          break;
        case 'one':
          if (!workers.length) workers.push(worker);
          break;
      }
    }
    if (type === 'one' && workers[0] !== cWorker) return [];
    return workers;
  }
  /**
   * bind event
   * @return {} []
   */
  bindEvent() {
    if (process[MessengerInit]) return;
    process[MessengerInit] = true;

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
   * run in one worker
   * @param  {Function} callback []
   * @return {}            []
   */
  runInOne(callback) {
    const id = taskId++;
    const actionName = `think-messenger-${id}`;
    process.send({
      act: MESSENGER,
      action: actionName,
      target: 'one'
    });
    this.once(actionName, data => {
      if (!helper.isError(data) && callback) {
        callback();
      }
    });
    this.setTimeout(actionName);
  }
}

module.exports = Messenger;
