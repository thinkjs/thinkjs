const assert = require('assert');
const net = require('net');
const helper = require('think-helper');
const util = require('./util.js');

/**
 * delegate class list
 */
let delegateClass = {};

/**
 * Agent worker class
 */
class Agent {
  /**
   * constructor
   * @param {Object} options 
   */
  constructor(options){
    this.options = util.parseOptions(options);
  }
  /**
   * do task in agent
   * @param {Object} data 
   */
  handleTask(data){
    let cls = delegateClass[data.classId];
    assert(cls, 'can not find class, classId: ${data.classId}');
    assert(helper.isArray(data.cArgs), '.cArgs must be an array');
    const instance = new cls(...data.cArgs);
    assert(cls[data.method], `class method ${data.method} not exist`);
    assert(data.mArgs, '.mArgs must be an array');
    try{
      let ret = instance[data.method](...data.mArgs);
      return Promise.resolve(ret);
    }catch(err){
      return Promise.reject(err);
    }
  }
  /**
   * handle server data
   * @param {String} data 
   */
  handleServerData(data, client){
    if(data === util.PIN){
      return client.write(util.PIN);
    }
    try{
      data = JSON.parse(data);
    }catch(err){
      return;
    }
    if(!data.taskId || !data.classId || !data.method) return;
    this.handleTask(data).then(result => {
      client.write(JSON.stringify({
        taskId: data.taskId,
        data: result
      }));
    }).catch(err => {
      client.write(JSON.stringify({
        taskId: data.taskId,
        err: err.message
      }));
    })
  }
  /**
   * create agent server
   */
  createServer(){
    const server = net.createServer(client => {
      client.on('data', data => {
        this.handleServerData(data, client);
      });
    });
    server.on('error', () => {
      server.close();
    });
    server.listen('', '127.0.0.1');
    return server;
  }
  /**
   * register class
   * @param {String} classId 
   * @param {Function} cls 
   */
  static register(classId, cls){
    if(delegateClass[classId]) return false;
    delegateClass[classId] = cls;
    return true;
  }
}

module.exports = Agent;
