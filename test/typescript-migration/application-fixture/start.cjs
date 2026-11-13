'use strict';

const cluster = require('node:cluster');
const Application = require('thinkjs');
const application = new Application({ROOT_PATH: __dirname, env: 'production'});

// IPC is only the acceptance harness's readiness/shutdown transport. The normal
// Application.run() master/worker startup and real HTTP server are unchanged.
if (cluster.isPrimary) {
  cluster.on('message', (worker, message) => {
    if (message && message.type === 'fixture-ready' && process.send) process.send(message);
  });
  process.on('message', message => {
    if (message === 'fixture-stop') {
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
    process.send({type: 'fixture-ready', port: think.app.server.address().port});
  });
}
application.run();
