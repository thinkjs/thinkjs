const helper = require('think-helper');
const {EventEmitter} = require('events');
const cluster = require('cluster');

class Messenger extends EventEmitter {
  constructor() {
    super();
    this.workerIds = {};
    this.callbacks = {};
    this.callbacks2 = {};
    this._bind = false;
  }

  bind() {
    if (!cluster.isMaster) return;
    if (this._bind) return;
    this._bind = true;
    cluster.on('fork', worker => {
      worker.on('message', msg => {
        if (!msg || !msg._think_worker) return;
        this.emit('workerMessage', msg);
      });
    });
    this.on('workerMessage', msg => {
      if (msg.act === 'broadcast') {
        this.broadcast(msg, true);
      } else if (msg.act === 'get_all_workers') {
        const result = this.getAllWorkers();
        const sendMsg = { act: 'get_all_workers_result', data: result, callbackId: msg.callbackId };
        const worker = cluster.workers[msg.workerId];
        if (worker) worker.send(sendMsg);
      } else if (msg.act === 'get_leader_worker') {
        const result = this.getLeaderWorker();
        const sendMsg = { act: 'get_leader_worker_result', data: result, callbackId: msg.callbackId };
        const worker = cluster.workers[msg.workerId];
        if (worker) worker.send(sendMsg);
      } else if (msg.act === 'run_in_one') {
        this.runInOne2(msg);
      }
    });
  }

  send(data) {
    if (cluster.isMaster) {
      for (const id in cluster.workers) {
        cluster.workers[id].send(data);
      }
    } else {
      data._think_worker = 1;
      process.send(data);
    }
  }

  broadcast(data, isMaster) {
    for (const id in cluster.workers) {
      cluster.workers[id].send(data);
    }
    if (!isMaster) {
      data._think_worker = 1;
      data.act = 'broadcast';
      process.send(data);
    }
  }

  getAllWorkers() {
    return Object.keys(cluster.workers).map(id => parseInt(id));
  }

  getLeaderWorker() {
    const workers = this.getAllWorkers();
    return Math.min.apply(null, workers);
  }

  runInOne(fn) {
    if (cluster.isMaster) {
      fn();
      return;
    }
    process.send({ act: 'run_in_one', _think_worker: 1, workerId: cluster.worker.id });
    process.once('message', msg => {
      if (msg && msg.act === 'run_in_one_result') {
        if (msg.run) fn();
      }
    });
  }

  runInOne2(msg) {
    const workerId = msg.workerId;
    if (!this.workerIds[workerId]) {
      this.workerIds[workerId] = Date.now();
      const worker = cluster.workers[workerId];
      if (worker) worker.send({ act: 'run_in_one_result', run: 1 });
    } else {
      const worker = cluster.workers[workerId];
      if (worker) worker.send({ act: 'run_in_one_result', run: 0 });
    }
  }
}

module.exports = Messenger;
