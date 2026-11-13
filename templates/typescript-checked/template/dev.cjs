'use strict';
const cluster = require('node:cluster');
const path = require('node:path');
const Application = require('thinkjs');
const checked = require('./scripts/checked.cjs');
const root = __dirname;
const release = cluster.isPrimary ? checked.lock(root) : () => {};
process.once('exit', release);
const application = new Application({
  ROOT_PATH: root, APP_PATH: path.join(root, 'app'), env: 'development',
  watcher: checked.Watcher,
  watcherOptions: {root, declarations: {configs: true}, resourceExtensions: checked.resourceExtensions,
    onError: error => console.error(error.code, error.message)}
});
// Register permanent lifecycle handlers before synchronous initial work. Do not
// swap signal handlers after a build: a queued signal can otherwise be dropped.
require('./scripts/lifecycle.cjs')(application);
// The new session's ledger starts from a checked, clean, template-owned app.
if (cluster.isPrimary) checked.build(root);
application.run();
