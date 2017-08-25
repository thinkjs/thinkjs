const path = require('path');
const cluster = require('cluster');
const helper = require('think-helper');
const thinkCluster = require('think-cluster');
const pm2 = require('think-pm2');
const http = require('http');
const assert = require('assert');
const mockHttp = require('think-mock-http');

const ThinkLoader = require('./loader.js');

/**
 * applition class
 */
module.exports = class Application {
  /**
   * constructor
   */
  constructor(options = {}) {
    assert(options.ROOT_PATH, 'options.ROOT_PATH must be set');
    if (!options.APP_PATH) {
      let appPath = path.join(options.ROOT_PATH, 'app');
      if (!options.transpiler && !helper.isDirectory(appPath)) {
        appPath = path.join(options.ROOT_PATH, 'src');
      }
      options.APP_PATH = appPath;
    }
    this.options = options;
  }
  /**
   * notify error
   */
  notifier(err) {
    if (!this.options.notifier) return;
    let notifier = this.options.notifier;
    if (!helper.isArray(notifier)) {
      notifier = [notifier];
    }
    notifier[0](Object.assign({
      title: 'ThinkJS Transpile Error',
      message: err.message
    }, notifier[1]));
  }
  /**
   * watcher callback
   */
  _watcherCallBack(fileInfo) {
    let transpiler = this.options.transpiler;
    if (transpiler) {
      if (!helper.isArray(transpiler)) {
        transpiler = [transpiler];
      }
      const ret = transpiler[0]({
        srcPath: fileInfo.path,
        outPath: this.options.APP_PATH,
        file: fileInfo.file,
        options: transpiler[1]
      });
      if (helper.isError(ret)) {
        console.error(ret.stack);
        this.notifier(ret);
        return false;
      }
      if (think.logger) {
        think.logger.info(`transpile file ${fileInfo.file} success`);
      }
    }
    // reload all workers
    if (this.masterInstance) {
      this.masterInstance.forceReloadWorkers();
    }
  }
  /**
   * start watcher
   */
  startWatcher() {
    const Watcher = this.options.watcher;
    if (!Watcher) return;
    const instance = new Watcher({
      srcPath: path.join(this.options.ROOT_PATH, 'src'),
      diffPath: this.options.APP_PATH
    }, fileInfo => this._watcherCallBack(fileInfo));
    instance.watch();
  }
  /**
   * parse argv
   */
  parseArgv() {
    const options = {};
    const argv2 = process.argv[2];
    const portRegExp = /^\d{2,5}$/;
    if (argv2) {
      if (!portRegExp.test(argv2)) {
        options.path = argv2;
      } else {
        options.port = argv2;
      }
    }
    return options;
  }
  /**
   * run in master
   */
  runInMaster(argv) {
    const instance = new thinkCluster.Master({
      port: argv.port || think.config('port'),
      host: think.config('host'),
      sticky: think.config('stickyCluster'),
      getRemoteAddress: socket => {
        return socket.remoteAddress || '';
      },
      workers: think.config('workers'),
      reloadSignal: think.config('reloadSignal'),
      enableAgent: false // think.config('enableAgent')
    });
    instance.startServer().then(() => {
      think.app.emit('appReady');
    });
    this.masterInstance = instance;
  }
  /**
   * run in worker
   * @param {Object} argv
   */
  runInWorker(argv) {
    const port = argv.port || think.config('port');
    const instance = new thinkCluster.Worker({
      port,
      host: think.config('host'),
      sticky: think.config('stickyCluster'),
      createServer() {
        const createServerFn = think.config('createServer');
        const callback = think.app.callback();
        if (createServerFn) {
          assert(helper.isFunction(createServerFn), 'config.createServer must be a function');
        }
        const server = createServerFn ? createServerFn(callback) : http.createServer(callback);
        think.app.server = server;
        return server;
      },
      logger: think.logger.error.bind(think.logger),
      processKillTimeout: think.config('processKillTimeout'),
      onUncaughtException: think.config('onUncaughtException'),
      onUnhandledRejection: think.config('onUnhandledRejection')
    });
    think.beforeStartServer().catch(err => {
      think.logger.error(err);
    }).then(() => {
      return instance.startServer();
    }).then(() => {
      think.app.emit('appReady');
    });

    think.app.once('appReady', () => {
      if (!thinkCluster.isFirstWorker()) return;
      think.logger.info(`Server running at http://${argv.host || '127.0.0.1'}:${port}`);
      think.logger.info(`ThinkJS version: ${think.version}`);
      think.logger.info(`Enviroment: ${think.app.env}`);
      think.logger.info(`Workers: ${instance.getWorkers()}`);
    });
  }
  /**
   * command line invoke
   */
  runInCli(argv) {
    think.app.emit('appReady');
    mockHttp({
      url: argv.path,
      method: 'CLI',
      exitOnEnd: true
    }, think.app);
  }
  /**
   * run in agent
   */
  runInAgent() {
    const instance = new thinkCluster.Agent();
    instance.createServer();
  }
  /**
   * run
   */
  run() {
    if (pm2.isClusterMode) {
      throw new Error('can not use pm2 cluster mode, please change exec_mode to fork');
    }
    // start file watcher
    if (cluster.isMaster) this.startWatcher();

    const instance = new ThinkLoader(this.options);
    const argv = this.parseArgv();
    try {
      if (argv.path) {
        instance.loadAll('worker', true);
        return this.runInCli(argv);
      } else if (cluster.isMaster) {
        instance.loadAll('master');
        this.runInMaster(argv);
      } else if (thinkCluster.isAgent()) {
        instance.loadAll('agent');
        this.runInAgent();
      } else {
        instance.loadAll('worker');
        this.runInWorker(argv);
      }
    } catch (e) {
      console.error(e);
    }
  }
};

/**
 * global think instance, mostly use in typescript
 */
module.exports.think = global.think;
