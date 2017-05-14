const test = require('ava');
const mock = require('mock-require');
const helper = require('think-helper');

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function getCrontab() {
  return mock.reRequire('../index');
}

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

function mockCluster(cluster) {
  mock('cluster',cluster);
}

test('constructor function', t => {
  let Crontab = getCrontab();
  let option = 'crontab/test';
  let cron = new Crontab(option);
  t.deepEqual(helper.isFunction(cron.options[0].handle), true);
  t.is(cron.options[0].type, 'one');
});

test('constructor function', t => {
  let Crontab = getCrontab();
  let option = {
    handle:'crontab/test',
    type:'one'
  };
  let cron = new Crontab(option);
  t.deepEqual(helper.isFunction(cron.options[0].handle), true);
  t.is(cron.options[0].type, 'one');
});

test('constructor function', t => {
  let Crontab = getCrontab();
  let option = {
    handle(){
      console.log('test');
    },
    type:'one',
    enable:true
  };
  let cron = new Crontab([option]);
  t.deepEqual(helper.isFunction(cron.options[0].handle), true);
  t.is(cron.options[0].type, 'one');
});

test('constructor function', t => {
  let Crontab = getCrontab();
  let option = {
    handle(){
      console.log('test');
    },
    enable:false
  };
  let cron = new Crontab(option);
  t.deepEqual(cron.options, []);
});

test('constructor function', async t => {
  let Crontab = getCrontab();
  let app = {
    on:(evtName,cb)=>{
      if(evtName === 'appReady'){
        cb();
      }
    },
    immediateExecuted:false,
    executedTime:0
  };
  let option = {
    handle:(app)=>{
      app.immediateExecuted = true;
      ++app.executedTime;
    },
    immediate:true,
    interval:'1s',
    type:'all'
  };
  let cron = new Crontab(option,app);
  cron.runTask();
  t.is(app.immediateExecuted,true);
  await sleep(3500);
  t.is(app.executedTime,4);
});































