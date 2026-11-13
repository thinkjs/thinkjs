const {test, after} = require('node:test');
const mock = require('mock-require');
const helper = require('think-helper');
const schedule = require('node-schedule');

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

after(() => {
  Object.keys(schedule.scheduledJobs).forEach(name => schedule.cancelJob(name));
});

function getCrontab() {
  // Reload the compiled implementation as well as the compatibility entry.
  delete require.cache[require.resolve('../lib/index')];
  return mock.reRequire('../index');
}

test('test case', t => {
  let Crontab = getCrontab();
  let option = 'crontab/test';
  let cron = new Crontab(option);
  t.assert.deepStrictEqual(helper.isFunction(cron.options[0].handle), true);
  t.assert.strictEqual(cron.options[0].type, 'one');
});

test('test case #2', t => {
  let Crontab = getCrontab();
  let option = {
    handle: 'crontab/test',
    type: 'one'
  };
  let cron = new Crontab(option);
  t.assert.deepStrictEqual(helper.isFunction(cron.options[0].handle), true);
  t.assert.strictEqual(cron.options[0].type, 'one');
});

test('test case #3', t => {
  let Crontab = getCrontab();
  let option = {
    handle(){
      console.log('test');
    },
    type: 'one',
    enable: true
  };
  let cron = new Crontab([option]);
  t.assert.deepStrictEqual(helper.isFunction(cron.options[0].handle), true);
  t.assert.strictEqual(cron.options[0].type, 'one');
});

test('test case #4', t => {
  let Crontab = getCrontab();
  let option = {
    handle(){
      console.log('test');
    },
    enable: false
  };
  let cron = new Crontab(option);
  t.assert.deepStrictEqual(cron.options, []);
});

test('test case #5', async t => {
  let Crontab = getCrontab();
  let app = {
    on: (evtName, cb) => {
      if (evtName === 'appReady') {
        cb();
      }
    },
    immediateExecuted: false,
    executedTime: 0
  };
  let option = {
    handle: (app) => {
      app.immediateExecuted = true;
      ++app.executedTime;
    },
    immediate: true,
    interval: '1s',
    type: 'all'
  };
  let cron = new Crontab(option, app);
  cron.runTask();
  t.assert.strictEqual(app.immediateExecuted, true);
  await sleep(3500);
  t.assert.strictEqual(app.executedTime, 4);
});

test('test case #6', async t => {
  let Crontab = getCrontab();
  let url = '';
  let app = {
    callback: (req, res) => {
      return (req, res) => {
        url = req.url;
      }
    },
    on: (evtName, cb) => {
      if (evtName === 'appReady') {
        cb();
      }
    },
  };
  let option = {
    name:'test',
    cron: '* * * * *',
    handle: './task',
    type: 'all',
    immediate: true
  };
  let cron = new Crontab(option, app);
  cron.runTask();
  t.assert.strictEqual(url, './task');
});

test('test case #7', async t => {
  let Crontab = getCrontab();
  let option = {
    handle: () => {
    },
    type: 'all'
  };
  let cron = new Crontab(option);
  let err;
  try {
    cron.runTask();
  } catch (e) {
    err = e;
  }
  t.assert.strictEqual(err instanceof Error, true);
});

test('test case #8', async t => {
  mock('think-cluster',{
    messenger:{
      runInOne:(fn)=>{
        fn();
      }
    }
  });
  mock('node-schedule', {
    scheduleJob: (cron,fn) => {
      fn();
    }
  });
  let Crontab = getCrontab();
  let url = '';
  let app = {
    callback: (req, res) => {
      return (req, res) => {
        url = req.url;
      }
    },
    on: (evtName, cb) => {
      if (evtName === 'appReady') {
        cb();
      }
    },
    isExecuted:false
  };
  let option = {
    name:'test',
    cron: '* * * * *',
    handle: (app)=>{
      app.isExecuted = true;
    },
    type: 'one',
    // immediate: true
  };
  let cron = new Crontab(option, app);
  cron.runTask();
  t.assert.strictEqual(app.isExecuted, true);
});

























