const helper = require('think-helper');
const Readable = require('stream').Readable;
const http = require('http');
const schedule = require('node-schedule');
const messenger = require('think-cluster').messenger;

const debug = require('debug')('think-crontab');

const IncomingMessage = http.IncomingMessage;
const ServerResponse = http.ServerResponse;

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
        type: 'one'
      }];
    }else if(!helper.isArray(options)){
      options = [options];
    }
    options = options.map(item => {
      item.type = item.type || 'one';
      if(!helper.isFunction(item.handle)){
        item.handle = () => this.mockServer(item.handle);
      }
      return item;
    }).filter(item => {
      if(item.enable !== undefined) return !!item.enable;
      return true;
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
   * run item task
   */
  runItemTask(item){
    if(item.type === 'all'){
      item.handle(this.app);
      debug(`run task ${item.taskName}, pid:${process.pid}`);
    }else{
      messenger.runInOne(() => {
        item.handle(this.app);
        debug(`run task ${item.taskName}, pid:${process.pid}`);
      });
    }
  }
  /**
   * run task
   */
  runTask(){
    this.options.forEach(item => {
      item.taskName = `${item.name ? ', name:' + item.name : ''}`;
      //immediate run task
      if(item.immediate){
        this.app.on('appReady', () => {
          this.runItemTask(item);
        });
      }
      if(item.interval){
        let interval = helper.ms(item.interval);
        let timer = setInterval(() => {
          this.runItemTask(item);
        }, interval);
        timer.unref();
        item.taskName += `interval: ${item.interval}`;
      }else if(item.cron){
        schedule.scheduleJob(item.cron, () => {
          this.runItemTask(item);
        });
        item.taskName += `, cron: ${item.cron}`;
      }else{
        throw new Error('.interval or .cron need be set');
      }
    });
  }
}

module.exports = Crontab;