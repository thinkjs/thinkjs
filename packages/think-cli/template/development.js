const Application = require('thinkjs');
const compiler = require('think-babel');
const watcher = require('think-watcher');
const notifier = require('node-notifier');

const instance = new Application({
  ROOT_PATH: __dirname,
  watcher: watcher,
  transpiler: [compiler, {
    presets: ['think-node']
  }],
  notifier: notifier.notify.bind(notifier),
  env: 'development'
});

instance.run();