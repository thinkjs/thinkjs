import helper = require('think-helper');
import schedule = require('node-schedule');
// think-cluster's legacy declaration extends an interface as a class and omits
// runInOne. Keep this one checked structural boundary until that package migrates.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const messenger = (require('think-cluster') as {messenger: {runInOne(callback: () => void): unknown}}).messenger;
import mockHttp = require('think-mock-http');
import createDebug = require('debug');

const debug = createDebug('think-crontab');

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Crontab {
  export type Handler<App> = (this: NormalizedTask<App>, app: App) => unknown;
  export interface Task<App = unknown> {
    handle: string | Handler<App>;
    name?: string;
    // Rules are forwarded unchanged to node-schedule, including Date and rule objects.
    cron?: string | Date | object;
    interval?: string | number;
    type?: string;
    enable?: unknown;
    immediate?: boolean;
    taskName?: string;
  }
  export type Options<App = unknown> = string | Task<App> | Task<App>[];
  export type NormalizedTask<App = unknown> = Omit<Task<App>, 'handle' | 'type'> & {
    handle: Handler<App>;
    type: string;
  };
}

class Crontab<App = undefined> {
  options: Crontab.NormalizedTask<App>[];
  app: App;

  // Omitted applications are typed as undefined, not as a fabricated instance.
  constructor(options: Crontab.Options<App>, ...args: undefined extends App ? [App?] : [App]);
  constructor(options: Crontab.Options<App>, app?: App) {
    this.options = this.parseOptions(options);
    this.app = app as App;
  }

  parseOptions(options: Crontab.Options<App>): Crontab.NormalizedTask<App>[] {
    if (helper.isString(options)) {
      options = [{handle: options as string, type: 'one'}];
    } else if (!helper.isArray(options)) {
      options = [options as Crontab.Task<App>];
    }
    return (options as Crontab.Task<App>[]).map(item => {
      item.type = item.type || 'one';
      if (!helper.isFunction(item.handle)) {
        const handle = item.handle;
        item.handle = () => mockHttp({method: 'CLI', url: handle}, this.app);
      }
      return item as Crontab.NormalizedTask<App>;
    }).filter(item => {
      if (item.enable !== undefined) return !!item.enable;
      return true;
    });
  }

  runItemTask(item: Crontab.NormalizedTask<App>): void {
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

  runTask(): void {
    this.options.forEach(item => {
      item.taskName = `${item.name ? ', name:' + item.name : ''}`;
      if (item.immediate) {
        // Only immediate tasks need the application's event API. URL handlers
        // separately need the mock-HTTP callback API; neither is globally required.
        (this.app as {on(event: 'appReady', callback: () => void): unknown}).on('appReady', () => {
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

export = Crontab;
