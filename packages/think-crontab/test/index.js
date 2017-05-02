const test = require('ava');
const mock = require('mock-require');
const helper = require('think-helper');
function getCrontab() {
  return mock.reRequire('../index');
}

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

test('constructor function', t => {
  let Crontab = getCrontab();
  let option = 'crontab/test';
  let cron = new Crontab(option);
  t.deepEqual(helper.isFunction(cron.options[0].handle), true);
  t.is(cron.options[0].worker, 'one');
});

test('constructor function', t => {
  let Crontab = getCrontab();
  let option = {
    handle:'crontab/test',
    worker:'one'
  };
  let cron = new Crontab(option);
  t.deepEqual(helper.isFunction(cron.options[0].handle), true);
  t.is(cron.options[0].worker, 'one');
});

test('constructor function', t => {
  let Crontab = getCrontab();
  let option = {
    handle(){
      console.log('test');
    },
    worker:'one',
    enable:true
  };
  let cron = new Crontab(option);
  t.deepEqual(helper.isFunction(cron.options[0].handle), true);
  t.is(cron.options[0].worker, 'one');
});

test('constructor function', t => {
  let Crontab = getCrontab();
  let option = {
    handle(){
      console.log('test');
    },
    worker:'one',
    enable:false
  };
  let cron = new Crontab(option);
  t.deepEqual(cron.options, []);
});