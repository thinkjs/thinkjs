const test = require('ava');
const mock = require('mock-require');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function getMessenger() {
  return mock.reRequire('../../lib/messenger');
}


class events {
  once(evtName,cb){
    cb();
  }
}

function mockEvents(){
  mock('events',events)
}

function mockCluster(isMaster){
  mock('cluster',{
    isMaster,
    on(evtName,cb){
      this[evtName] = cb;
    },
    trigger(evtName,message,worker){
      this[evtName](worker,message)
    }
  })
}

function mockProcess() {
  process.on = (evtName,cb)=>{
    process[evtName] = cb;
  }

  process.once = (evtName,cb)=>{
    process[evtName] = cb;
  }

  process.send = (args = {}) => {
    process.sendObj = args;
  }

  process.exit = ()=>{
    process.isKilled = true
  }

  process.trigger = (evtName,args={}) => {
    process['is'+evtName] = true;
    process[evtName](args);
  }
  process.emit = ()=>{
    console.log('emit');
  }
}

test('runInOne case', async t => {
  mockEvents();
  const Messenger = getMessenger();
  let m = new Messenger();

  let flag = false;

  const fn = ()=>{
    flag = true;
  };

  m.runInOne(fn);
  await sleep(5000)
  t.is(flag,true);
});

test('runInOne case', async t => {
  mockEvents();
  const Messenger = getMessenger();
  let m = new Messenger();

  let flag = false;

  m.runInOne();
  await sleep(5000)
  t.is(flag,false);
});

test('broadcast case', async t => {
  mockEvents();
  const Messenger = getMessenger();
  let m = new Messenger();

  m.broadcast(()=>{},'test');
});

test('bindEvent case', async t => {
  mockCluster(true);
  const cluster = require('cluster');
  const Messenger = getMessenger();
  let m = new Messenger();
  const message = {
    act:'think-messenger',
    target:'one'
  }
  cluster.trigger('message',message,{});
});