'use strict';

const cluster = require('node:cluster');
const Application = require('thinkjs');
const options = {ROOT_PATH: __dirname, env: 'production'};
const checked = process.env.THINKJS_FIXTURE_WATCH === 'checked';
if (checked) {
  options.APP_PATH = require('node:path').join(__dirname, 'app');
  options.watcher = require('think-ts-helper/development').createWatcher(require('think-watcher/tracked'), require('typescript'));
  options.watcherOptions = {root: __dirname, interval: 100, declarations: {models: true, configs: true},
    onError: error => { if (process.send) process.send({type: 'fixture-watch-error', code: error.code}); }};
}
if (process.env.THINKJS_FIXTURE_WATCH === '1') {
  options.watcher = require('think-watcher/tracked');
  options.transpiler = [require('think-typescript'), {compilerOptions: {
    module: 'commonjs', target: 'es2018', sourceMap: true
  }}];
  options.watcherOptions = {interval: 20, onError: error => {
    if (process.send) process.send({type: 'fixture-watch-error', code: error.code});
  }};
}
const application = new Application(options);
if (cluster.isPrimary && (checked || process.env.THINKJS_FIXTURE_WATCH === '1')) {
  const callback = application._watcherCallBack;
  application._watcherCallBack = function(info) {
    if (checked && info.event === 'build' && process.send) {
      process.send({type: 'fixture-checked-build', durationMs: info.durationMs});
    }
    const master = this.masterInstance;
    if (!master) return callback.call(this, info);
    const reload = master.forceReloadWorkers;
    master.forceReloadWorkers = function(...args) {
      if (process.send) process.send({type: 'fixture-reload-request'});
      return reload.apply(this, args);
    };
    try { return callback.call(this, info); }
    finally { master.forceReloadWorkers = reload; }
  };
}

// IPC is only the acceptance harness's readiness/shutdown transport. The normal
// Application.run() master/worker startup and real HTTP server are unchanged.
if (cluster.isPrimary) {
  cluster.on('message', (worker, message) => {
    if (message && message.type === 'fixture-ready' && process.send) process.send(message);
  });
  process.on('message', message => {
    if (message === 'fixture-stop') {
      if (application.watcherInstance) application.watcherInstance.close();
      // Prevent the framework's deliberate worker-refork handlers during teardown.
      for (const worker of Object.values(cluster.workers)) {
        worker.removeAllListeners('disconnect');
        worker.removeAllListeners('exit');
      }
      cluster.disconnect(() => process.exit(0));
    }
  });
} else {
  think.app.once('appReady', () => {
    process.send({type: 'fixture-ready', pid: process.pid, port: think.app.server.address().port});
  });
}
application.run();
