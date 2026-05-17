const test = require('ava');
const mock = require('mock-require');
const path = require('path');
const helper = require('think-helper');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function getMaster() {
  return mock.reRequire('../../lib/master');
}

// test.afterEach.always(() => {
//   mock.stop('cluster');
// });

function mockCluster() {
  mock('cluster', {
    workers: [],
    fork(env = {}) {
      let worker = {
        on(evtName, cb) {
          this[evtName] = cb;
        },
        once(evtName, cb) {
          this.on(evtName, cb);
          if (evtName === 'listening') {
            cb('test address');
          }
        },
        trigger(evtName, args) {
          const cluster = require('cluster');
          if (evtName === 'exit') {
            const workers = Array.from(cluster.workers);
            cluster.workers.forEach((item, index) => {
              if (item === this) {
                workers.splice(index, 1);
              }
            });
            cluster.workers = workers;
          }
          this[evtName](args);
        },
        send(signal) {
          // console.log(signal);
        },
        kill() {
          // this.isKilled = true;
        },
        isConnected() {
          return !this.isKilled;
        },
        process: {
          kill: () => {
            worker.isKilled = true;
          }
        }
      };
      worker = Object.assign(worker, env);
      const cluster = require('cluster');
      cluster.workers.push(worker);
      return worker;
    },
    on: () => {},
    trigger(evtName, args) {
      this.workers.forEach(worker => {
        worker.trigger(evtName, args);
      });
    }
  });
}

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master();
  await instance.forkWorkers();
  cluster.trigger('message', 'think-graceful-disconnect');
  cluster.trigger('message', 'test');
  t.is(cluster.workers[0].hasGracefulReload, undefined);
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master();
  await instance.forkWorkers();
  t.is(cluster.workers.length, require('os').cpus().length);
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master();
  await instance.forkWorkers();
  cluster.trigger('message', 'think-graceful-disconnect');
  cluster.trigger('exit');
  t.is(cluster.workers.length, require('os').cpus().length);
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({reloadSignal: 'SIGUSR2'});
  await instance.forkWorkers();
  await process.kill(process.pid, 'SIGUSR2');
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  cluster.trigger('listening');
  t.is(cluster.workers.length, require('os').cpus().length);
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  await instance.killWorker(cluster.workers[0]);
  await sleep(1000);
  t.is(cluster.workers[0].isKilled, true);
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  await instance.killWorker(cluster.workers[0], true);
  await sleep(1000);
  await instance.killWorker(cluster.workers[0]);
  await sleep(1000);
  t.is(cluster.workers[0].isKilled, true);
  t.is(cluster.workers[0].hasGracefulReload, undefined);
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master();
  await instance.forkWorkers();
  instance.forceReloadWorkers();
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  cluster.workers[0].state = 'disconnected';
  instance.forceReloadWorkers();
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  instance.forceReloadWorkers();
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  const instance = new Master({});
  await instance.forkWorkers();
  cluster.workers = [];
  instance.forceReloadWorkers();
});
