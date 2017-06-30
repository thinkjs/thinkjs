import test from 'ava';
const mock = require('mock-require');
const mockie = require('../lib/mockie');
const thinkCluster = require('think-cluster');

function getApplication() {
  return mock.reRequire('../../lib/application');
}

const defaultOption = {
  ROOT_PATH: __dirname
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
  mockie.mockThinkCluster(true);
  mockie.mockThinkMockHttp();
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}}
  app.run();
  t.is(require('think-cluster').createdServer,true)
})




