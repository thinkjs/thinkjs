import test from 'ava';
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


test.serial('normal test', t => {
  mockie.mockThinkMockHttp();
  const App = getApplication();
  let app = new App(defaultOption);
  app.run();
  t.is(think.isCli, true)
})

test.serial('runInMaster', t => {
  mockie.mockCluster(true);
  mockie.mockThinkMockHttp();
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}}
  app.run();
  t.is(app.masterInstance instanceof thinkCluster.Master,true)
})

test.serial('runInAgent', t => {
  mockie.mockCluster(false);
  mockie.mockThinkCluster({agent:true});
  mockie.mockThinkMockHttp();
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}};
  app.run();
  t.is(require('think-cluster').createdServer,true)
})

test.serial('runInWorker', async t => {
  mockie.mockCluster(false);
  mockie.mockThinkCluster({isFirstWorker:()=>{return true}});
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}};
  app.run();
  await utils.sleep(1000)
  t.is(require('think-cluster').capturedEvents,true)
})

test.serial('runInWorker with createServerFn ', async t => {
  mockie.mockCluster(false);
  mockie.mockThinkCluster({isFirstWorker:()=>{return true}});
  const App = getApplication();
  const option = Object.assign({},defaultOption,{APP_PATH: path.resolve(__dirname,'../runtime')});
  let app = new App(option);
  app.parseArgv = ()=>{return {}};
  app.run();
  await utils.sleep(1000)
  t.is(require('think-cluster').capturedEvents,true)
})

test.serial('watcher', t => {
  mockie.mockThinkMockHttp();
  const App = getApplication();
  const watcher = class Watcher {
    constructor(options,cb){
      this.options = options;
      this.cb = cb;
    }
    watch(){
      console.log('start watch');
      this.cb({});
    }
  };
  const option = Object.assign({}, defaultOption, {watcher});
  let app = new App(option);
  app.run();
  t.is(think.isCli, true)
})