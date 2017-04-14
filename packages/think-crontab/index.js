const helper = require('think-helper');
const Readable = require('stream').Readable;
const http = require('http');
const schedule = require('node-schedule');
const assert = require('assert');
const cluster = require('cluster');
const debug = require('debug')('think-crontab');

const IncomingMessage = http.IncomingMessage;
const ServerResponse = http.ServerResponse;
const isMaster = cluster.isMaster;

/**
 * default mock args
 */
const defaultArgs = {
  method: 'GET',
  httpVersion: '1.1'
}
/**
 * crontab class
 */
class Crontab {
  /**
   * constructor
   * @param {Object|String} options 
   * @param {Object} app koa app
   */
  constructor(options, app){
    this.options = this.parseOptions(options);
    this.app = app;
  }
  /**
   * parse options
   * @param {Object|String} options 
   */
  parseOptions(options){
    if(helper.isString(options)){
      options = [{
        handle: options,
        worker: 'one'
      }];
    }else if(!helper.isArray(options)){
      options = [options];
    }
    options = options.map(item => {
      item.worker = item.worker || 'one';
      if(!helper.isFunction(item.handle)){
        item.handle = () => this.mockServer(item.handle);
      }
      return item;
    });
    return options;
  }
  /**
   * mock server
   * @param {String|Object} cronpath 
   */
  mockServer(cronpath){
    let args = this.mockServerArgs(cronpath);
    let fn = this.app.callback();
    process.nextTick(() => fn(args.req, args.res));
  }
  /**
   * mock server args
   * @param {String|Object} cronpath 
   */
  mockServerArgs(cronpath){
    if(helper.isString(cronpath)){
      cronpath = {url: cronpath};
    }
    const socket = new Readable();
    const req = new IncomingMessage(socket);
    const args = Object.assign({}, defaultArgs, cronpath);
    for(let name in args){
      req[name] = args[name];
    }
    const res = new ServerResponse(req);
    return {req, res};
  }
  /**
   * get task workers
   */
  getWorkers(type){
    let allWorkers = Object.keys(cluster.workers).map(id => cluster.workers[id]).filter(worker => {
      return !worker.isAgent;
    });
    if(type === 'all'){
      return allWorkers;
    }
    return [allWorkers[Math.floor(Math.random() * allWorkers.length)]];
  }
  /**
   * run task
   */
  runTask(){
    this.options.forEach((item, index) => {
      let action = `think_crontab_index_${index}`;
      if(isMaster){
        //immediate run task
        if(item.immediate){
          this.app.on('appReady', () => {
            let workers = this.getWorkers(item.worker);
            workers.forEach(worker => worker.send({act: action}));
          });
        }
        if(item.interval){
          let interval = helper.ms(item.interval);
          let timer = setInterval(() => {
            let workers = this.getWorkers(item.worker);
            workers.forEach(worker => worker.send({act: action}));
          }, interval);
        }else if(item.cron){
          schedule.scheduleJob(item.cron, () => {
            let workers = this.getWorkers(item.worker);
            workers.forEach(worker => worker.send({act: action}));
          });
        }else{
          throw new Error('.interval or .cron need be set');
        }
      }else{
        let taskName = `${item.name ? ', name:' + item.name : ''}`;
        if(item.interval){
          taskName += `, interval: ${item.interval}`;
        }else{
          taskName += `, cron: ${item.cron}`;
        }
        process.on('message', message => {
          if(message && message.act === action){
            debug(`run task${taskName}, pid:${process.pid}`);
            item.handle();
          }
        });
      }
    });
  }
}

module.exports = Crontab;