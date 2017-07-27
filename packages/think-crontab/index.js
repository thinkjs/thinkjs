const helper = require('think-helper');
const schedule = require('node-schedule');
const messenger = require('think-cluster').messenger;
const mockHttp = require('think-mock-http');
const debug = require('debug')('think-crontab');

/**
 * crontab class
 */
class Crontab {
  /**
   * constructor
   * @param {Object|String} options 
   * @param {Object} app koa app
   */
  constructor(options, app) {
    this.options = this.parseOptions(options);
    this.app = app;
  }
  /**
   * parse options
   * @param {Object|String} options 
   */
  parseOptions(options) {
    if (helper.isString(options)) {
      options = [{
        handle: options,
        type: 'one'
      }];
    } else if (!helper.isArray(options)) {
      options = [options];
    }
    options = options.map(item => {
      item.type = item.type || 'one';
      if (!helper.isFunction(item.handle)) {
        const handle = item.handle;
        item.handle = () => mockHttp({method: 'CLI', url: handle}, this.app);
      }
      return item;
    }).filter(item => {
      if (item.enable !== undefined) return !!item.enable;
      return true;
    });
    return options;
  }
  /**
   * run item task
   */
  runItemTask(item) {
    if (item.type === 'all') {
      item.handle(this.app);
      debug(`run task ${item.taskName}, pid:${process.pid}`);
    } else {
      messenger.runInOne(() => {
        item.handle(this.app);
        debug(`run task ${item.taskName}, pid:${process.pid}`);
      });
    }
  }
  /**
   * run task
   */
  runTask() {
    this.options.forEach(item => {
      item.taskName = `${item.name ? ', name:' + item.name : ''}`;
      // immediate run task
      if (item.immediate) {
        this.app.on('appReady', () => {
          this.runItemTask(item);
        });
      }
      if (item.interval) {
        const interval = helper.ms(item.interval);
        const timer = setInterval(() => {
          this.runItemTask(item);
        }, interval);
        timer.unref();
        item.taskName += `interval: ${item.interval}`;
      } else if (item.cron) {
        schedule.scheduleJob(item.cron, () => {
          this.runItemTask(item);
        });
        item.taskName += `, cron: ${item.cron}`;
      } else {
        throw new Error('.interval or .cron need be set');
      }
    });
  }
}

module.exports = Crontab;
