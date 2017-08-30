const Application = require('thinkjs');
const typescript = require('think-typescript');
const watcher = require('think-watcher');
const notifier = require('node-notifier');

const instance = new Application({
  ROOT_PATH: __dirname,
  watcher: watcher,
  transpiler: [typescript],
  notifier: notifier.notify.bind(notifier),
  env: 'development'
});

instance.run();
