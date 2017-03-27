const util = require('./util.js');
const helper = require('think-helper');
const net = require('net');

let delegateClass = {};

const STATUS = Symbol('think-agent-client-status');

/**
 * agent client
 */
class AgentClient {
  /**
   * constructor
   */
  constructor(){
    this.client = null;
    this.tasks = {};
  }
  /**
   * get status
   */
  get status(){
    return this[STATUS] || 'waiting';
  }
  /**
   * set status
   */
  set status(status){
    if(this.status === status) return;
    this[STATUS] = status;
    if(status === 'connected'){
      this.captureData();
      for(let taskId in this.tasks){
        let data = this.tasks[taskId].data;
        this.sendData(data);
      }
    }else if(status === 'closed'){
      process.emit(util.THINK_AGENT_CLOSED);
      this.doLeaveTask();
    }
  }
  /**
   * do leave task
   */
  doLeaveTask(){
    for(let taskId in this.tasks){
      let item = this.tasks[taskId];
      let options = item.options;
      let args = item.data.mArgs;
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
  captureData(){
    let pinTimes = 0;
    this.client.on('data', data => {
      if(data === util.PIN){
        pinTimes--;
        return;
      }
      this.handleData(data);
    });
    let timer = setInterval(() => {
      pinTimes++;
      this.client.write(util.PIN);
      if(pinTimes > 5){
        this.status = 'closed';
      }
    }, 3 * 1000);
    timer.unref();
  }
  /**
   * handle client data
   * @param {String} data 
   */
  handleData(data){
    try{
      data = JSON.parse(data);
    }catch(err){
      return;
    }
    let deferred = this.tasks[data.taskId];
    if(!deferred) return;
    if(data.err){
      deferred.reject(new Error(data.err));
    }else{
      deferred.resolve(data.data);
    }
    delete this.tasks[data.taskId];
  }
  /**
   * client is connected
   */
  get isConnected(){
    return this.status === 'connected';
  }
  /**
   * agent is closed
   */
  get isClosed(){
    return this.status === 'closed';
  }
  /**
   * register class
   * @param {String} classId 
   * @param {Function} cls 
   */
  register(classId, cls){
    if(delegateClass[classId]) return false;
    delegateClass[classId] = cls;
    return true;
  }
  /**
   * createConnection
   */
  createConnection(){
    if(this.client) return;
    let options = util.getAgentConnectOptions();
    const client = net.connect(options, () => {
      this.status = 'connected';
    });
    client.on('close', () => {
      this.status = 'closed';
    });
    client.on('error', () => {
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
  sendData(data){
    this.client.write(JSON.stringify(data));
  }
  /**
   * send task
   * @param {Object} data 
   */
  send(data, options){
    const taskId = helper.uuid().slice(0, 8);
    data.taskId = taskId;
    let deferred = helper.defer();
    deferred.options = options;
    if(this.isConnected){
      this.sendData(data);
    }else{
      deferred.data = data;
      this.createConnection();
    }
    this.tasks[taskId] = deferred;
    return deferred.promise;
  }
}

module.exports = AgentClient;