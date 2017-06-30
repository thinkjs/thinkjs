import test from 'ava';
const mock = require('mock-require');
const mockie = require('../lib/mockie');
const utils = require('../lib/utils');
const thinkCluster = require('think-cluster');
const path = require('path');

function getApplication() {
  return mock.reRequire('../../lib/application');
}

const defaultOption = {
  ROOT_PATH: __dirname,
  // APP_PATH: path.resolve(__dirname,'../runtime')
}

test.afterEach.always(() => {
  mockie.stop();
});


test.serial('test', t => {
  mockie.mockThinkMockHttp();
  const App = getApplication();
  let app = new App(defaultOption);
  app.run();
  t.is(think.isCli, true)
})

test.serial('test', t => {
  mockie.mockCluster(true);
  mockie.mockThinkMockHttp();
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}}
  app.run();
  t.is(app.masterInstance instanceof thinkCluster.Master,true)
})

test.serial('test', t => {
  mockie.mockCluster(false);
  mockie.mockThinkCluster({agent:true});
  mockie.mockThinkMockHttp();
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}};
  app.run();
  t.is(require('think-cluster').createdServer,true)
})

test.serial('test', async t => {
  mockie.mockCluster(false);
  mockie.mockThinkCluster({isFirstWorker:()=>{return true}});
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}};
  app.run();
  await utils.sleep(1000)
  t.is(require('think-cluster').capturedEvents,true)
})


