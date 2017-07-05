import test from 'ava';
const mock = require('mock-require');
// const mockie = require('../lib/mockie');
// const utils = require('../lib/utils');
// const path = require('path');

function getLoader() {
  return mock.reRequire('../../lib/loader');
}

// test.afterEach.always(() => {
//   mockie.stop();
// });

mock('think-crontab',class Crontab{
  runTask(){
  }
})

test.serial('normal test', t => {
  const Loader = getLoader();
  let options = {
    env:'development',
    proxy:'http://localhost:8888'
  };

  let loader = new Loader(options);
  loader.initPath();
  t.is(think.app.env,options.env);
  t.is(think.app.proxy,options.proxy)
})
