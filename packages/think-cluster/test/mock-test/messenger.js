const test = require('ava');
const mock = require('mock-require');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

mockCluster(true);

function getMessenger() {
  return mock.reRequire('../../lib/messenger');
}

class events {
  once(evtName, cb) {
    cb();
  }
  listenerCount(){
    return 1;
  }
  emit() {}
}

function mockEvents() {
  mock('events', events);
}

function mockCluster(isMaster) {
  mock('cluster', {
    receiveSignal: false,
    workers: {
      1: {type: 'one', isAgent: false, send() { require('cluster').receiveSignal = true }},
      2: {type: 'all', isAgent: true, send() { require('cluster').receiveSignal = true }}
    },
    isMaster,
    on(evtName, cb) {
      this[evtName] = cb;
    },
    trigger(evtName, message, worker) {
      this[evtName](worker, message);
    }
  });
}

function mockProcess() {
  process.on = (evtName, cb) => {
    process[evtName] = cb;
  };

  process.trigger = (evtName, args = {}) => {
    process['is' + evtName] = true;
    process[evtName](args);
  };
}

test('runInOne case', async t => {
  mockEvents();
  const Messenger = getMessenger();
  const m = new Messenger();

  let flag = false;

  const fn = () => {
    flag = true;
  };

  m.runInOne(fn);
  await sleep(5000);
  t.is(flag, true);
});

test('runInOne case 2', async t => {
  mockEvents();
  const Messenger = getMessenger();
  const m = new Messenger();

  const flag = false;

  m.runInOne(() => {});
  await sleep(5000);
  t.is(flag, false);
});

test('broadcast case 8', async t => {
  mockEvents();
  const Messenger = getMessenger();
  const m = new Messenger();
  m.broadcast(() => {}, 'test');
});

test('bindEvent case 7', async t => {
  mockCluster(true);
  const cluster = require('cluster');
  const Messenger = getMessenger();
  const m = new Messenger();
  const message = {
    act: 'think-messenger',
    target: 'one'
  };
  cluster.trigger('message', message, {});
});

test('bindEvent case 6', async t => {
  mockCluster(true);
  const cluster = require('cluster');
  const Messenger = getMessenger();
  const m = new Messenger();
  const message = {
    act: 'test',
    target: 'one'
  };
  cluster.trigger('message', message, {});
});

test('bindEvent case 5', async t => {
  mockCluster(false);
  mockProcess();
  mockEvents();
  const cluster = require('cluster');
  const Messenger = getMessenger();
  const m = new Messenger();
  m.bindEvent();
  const message = {
    act: 'think-messenger',
    target: 'one'
  };
  process.trigger('message', message);
  t.is(process['ismessage'], true);
});

test('bindEvent case 4', async t => {
  mockCluster(false);
  mockProcess();
  mockEvents();
  const cluster = require('cluster');
  const Messenger = getMessenger();
  const m = new Messenger();
  m.bindEvent();
  const message = {
    act: 'test',
    target: 'one'
  };
  process.trigger('message', message);
  t.is(process['ismessage'], true);
});

test('bindEvent case 2', async t => {
  mockCluster(true);
  const cluster = require('cluster');
  const Messenger = getMessenger();
  const m = new Messenger();
  const message = {
    act: 'think-messenger',
    target: 'all'
  };
  cluster.trigger('message', message, {});
  t.is(cluster.receiveSignal, true);
});

test('bindEvent case 3', async t => {
  mockCluster(true);
  const cluster = require('cluster');
  const Messenger = getMessenger();
  const m = new Messenger();
  const message = {
    act: 'think-messenger',
    target: 'all'
  };
  cluster.trigger('message', message, {});
  t.is(cluster.receiveSignal, true);
});

test('bindEvent case 3', async t => {
  mockCluster(true);
  const cluster = require('cluster');
  const Messenger = getMessenger();
  const m = new Messenger();
  const message = {
    act: 'think-messenger',
    target: 'all'
  };
  cluster.trigger('message', message, {});
  t.is(cluster.receiveSignal, true);
});

test('bindEvent case', async t => {
  mockCluster(true);
  const cluster = require('cluster');
  const Messenger = getMessenger();
  const m = new Messenger();
  const message = {
    act: 'think-messenger'
  };
  cluster.trigger('message', message, {});
  t.is(cluster.receiveSignal, true);
});
