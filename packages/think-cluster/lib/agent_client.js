const util = require('./util.js');
const helper = require('think-helper');
const net = require('net');
const debug = require('debug')('think-cluster');

const STATUS = Symbol('think-agent-client-status');
const INSTANCE = Symbol('think-agent-client-instance');
/**
 * agent client
 */
class AgentClient {
  /**
   * constructor
   */
  constructor() {
    this.client = null;
    this.tasks = {};
    // get agent server address
    process.on('message', message => {
      if (message && message.act === util.THINK_AGENT_OPTIONS) {
        debug(`receive agent worker address: ${JSON.stringify(message.address)}, pid:${process.pid}`);
        this.createConnection(message.address);
      }
    });
  }
  /**
   * get status
   */
  get status() {
    return this[STATUS] || 'waiting';
  }
  /**
   * set status
   */
  set status(status) {
    if (this.status === status) return;
    this[STATUS] = status;
    if (status === 'connected') {
      this.captureData();
      for (const taskId in this.tasks) {
        const data = this.tasks[taskId].data;
        this.sendData(data);
      }
    } else if (status === 'closed') {
      // process.emit(util.THINK_AGENT_CLOSED);
      // this.doLeaveTask();
    }
  }
  /**
   * do leave task
   */
  doLeaveTask() {
    for (const taskId in this.tasks) {
      const item = this.tasks[taskId];
      const options = item.options;
      const args = item.data.mArgs;
      options.method.apply(options.ctx, args).then(data => {
        item.resolve(data);
      }).catch(err => {
        item.reject(err);
      });
    }
    this.tasks = {};
  }
  /**
   * capture data
   */
  captureData() {
    // let pinTimes = 0;
    this.client.on('data', data => {
      // if(data === util.PIN){
      //   pinTimes--;
      //   return;
      // }
      this.handleData(data);
    });
    // let timer = setInterval(() => {
    //   pinTimes++;
    //   this.client.write(util.PIN);
    //   if(pinTimes > 5){
    //     this.status = 'closed';
    //   }
    // }, 3 * 1000);
    // timer.unref && timer.unref();
  }
  /**
   * handle client data
   * @param {String} data 
   */
  handleData(data) {
    try {
      data = JSON.parse(data);
    } catch (err) {
      return;
    }
    const deferred = this.tasks[data.taskId];
    if (!deferred) return;
    if (data.err) {
      deferred.reject(new Error(data.err));
    } else {
      deferred.resolve(data.data);
    }
    delete this.tasks[data.taskId];
  }
  /**
   * client is connected
   */
  get isConnected() {
    return this.status === 'connected';
  }
  /**
   * agent is closed
   */
  get isClosed() {
    return this.status === 'closed';
  }
  /**
   * createConnection
   */
  createConnection(options) {
    const client = net.connect(options, () => {
      debug(`connect agent server success, pid: ${process.pid}`);
      this.status = 'connected';
    });
    client.on('close', () => {
      debug(`agent server closed, pid: ${process.pid}`);
      this.status = 'closed';
    });
    client.on('error', err => {
      debug(`connect agent server error, message: ${err.message}, pid: ${process.pid}`);
      this.status = 'closed';
    });
    client.on('end', () => {
      this.status = 'closed';
    });
    this.client = client;
  }
  /**
   * send data to agent
   * @param {Object} data 
   */
  sendData(data) {
    this.client.write(JSON.stringify(data));
  }
  /**
   * send task
   * @param {Object} data 
   */
  send(data, options) {
    const taskId = helper.uuid().slice(0, 8);
    data.taskId = taskId;
    const deferred = helper.defer();
    deferred.options = options;
    if (this.isConnected) {
      this.sendData(data);
    } else {
      deferred.data = data;
    }
    this.tasks[taskId] = deferred;
    return deferred.promise;
  }
  /**
   * get instance
   */
  static getInstance() {
    if (this[INSTANCE]) return this[INSTANCE];
    this[INSTANCE] = new AgentClient();
    return this[AgentClient];
  }
}

module.exports = AgentClient;
