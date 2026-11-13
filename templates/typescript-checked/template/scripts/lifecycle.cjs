'use strict';
const cluster = require('node:cluster');
module.exports = application => {
  if (!cluster.isPrimary) return;
  let closing = false;
  const close = () => {
    if (closing) return;
    closing = true;
    if (application.watcherInstance) application.watcherInstance.close();
    // ThinkCluster otherwise deliberately reforks disconnected workers.
    for (const worker of Object.values(cluster.workers)) {
      worker.removeAllListeners('disconnect');
      worker.removeAllListeners('exit');
    }
    const timeout = setTimeout(() => {
      for (const worker of Object.values(cluster.workers)) worker.process.kill('SIGKILL');
      process.exit(1);
    }, 5000);
    timeout.unref();
    cluster.disconnect(() => { clearTimeout(timeout); process.exit(0); });
  };
  process.on('SIGINT', close);
  process.on('SIGTERM', close);
};
