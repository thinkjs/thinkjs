import test from 'ava';
const mock = require('mock-require');
const mockie = require('../lib/mockie');
const utils = require('../lib/utils');
const path = require('path');

function getApplication() {
  return mock.reRequire('../../lib/application');
}

mockie.mockConsoleError();

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
  t.is(think.isCli, undefined)
})

test.serial('runInMaster', t => {
  mockie.mockCluster(true);
  mockie.mockThinkCluster();
  mockie.mockThinkMockHttp();
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}}
  app.run();
  console.log('app.masterInstance', app.masterInstance)
  t.is(app.masterInstance instanceof require('think-cluster').Master,true)
})

// test.serial('runInAgent', t => {
//   mockie.mockCluster(false);
//   mockie.mockThinkCluster({agent:true});
//   mockie.mockThinkMockHttp();
//   const App = getApplication();
//   let app = new App(defaultOption);
//   app.parseArgv = ()=>{return {}};
//   app.run();
//   t.is(require('think-cluster').createdServer,true)
// })

test.serial('runInWorker', async t => {
  mockie.mockCluster(false);
  mockie.mockThinkCluster({isFirstWorker:()=>{return true}});
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}};
  //think.isCli = false
  app.run();
  await utils.sleep(1000)
  // console.log(think.Controller.toString());
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

test.serial('runInWorker with non-first worker', async t => {
  mockie.mockCluster(false);
  mockie.mockThinkCluster({isFirstWorker:()=>{return false}});
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {port:8361}};
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
  t.is(think.isCli, undefined)
})

test.serial('_watcherCallBack', t => {
  const App = getApplication();
  const babel = (options)=> {};
  const option = Object.assign({}, defaultOption, {
    transpiler: [babel,{
      presets: ['think-node']
    }],
  });
  let app = new App(option);
  app._watcherCallBack({path:'/',file:'tests.js'});
})

test.serial('_watcherCallBack with non-logger', t => {
  const App = getApplication();
  const babel = (options)=> {};
  think.logger = null;
  const option = Object.assign({}, defaultOption, {
    transpiler: [babel,{
      presets: ['think-node']
    }],
  });
  let app = new App(option);
  app._watcherCallBack({path:'/',file:'tests.js'});
})

test.serial('_watcherCallBack with non-array transpiler and throw error', t => {
  const App = getApplication();
  const babel = (options)=> {
    return new Error('test error')
  };
  const option = Object.assign({}, defaultOption, {
    transpiler: babel
  });
  let app = new App(option);
  let result = app._watcherCallBack({path: '/', file: 'tests.js'});

  t.is(result, false);
})

test.serial('notifier', t => {
  const App = getApplication();
  let result = null;
  let construct = (data)=>{
    result = data;
  }
  const option = Object.assign({}, defaultOption, {
    notifier:[
      construct,
      {
        sound:true
      }
    ]
  });
  let app = new App(option);
  const err = new Error('test error');
  app.notifier(err);
  t.is(result.message,'test error');
})

test.serial('notifier with non-array options', t => {
  const App = getApplication();
  let result = null;
  let construct = (data)=>{
    result = data;
  }
  const option = Object.assign({}, defaultOption, {
    notifier:construct
  });
  let app = new App(option);
  const err = new Error('test error');
  app.notifier(err);
  t.is(result.message,'test error');
})

test.serial('_watcherCallBack with masterInstance', t => {
  mockie.mockCluster(true);
  mockie.mockThinkCluster();
  mockie.mockThinkMockHttp();
  const App = getApplication();
  const babel = (options)=> {};
  const option = Object.assign({}, defaultOption, {
    transpiler: babel
  });
  let app = new App(option);
  app.parseArgv = ()=>{return {}};
  app.run();
  app._watcherCallBack({path:'/',file:'tests.js'});
  t.is(app.masterInstance instanceof require('think-cluster').Master,true);
})

test.serial('run with pm2 cluster mode', t => {
  mockie.mockThinkPm2({isClusterMode:true});
  const App = getApplication();
  const app = new App(defaultOption);
  let err = null;
  try{
    app.run();
  }catch(e){
    err = e;
  }
  t.is(err instanceof Error,true);
})

// test.serial('run with exception', t => {
//   mockie.mockCluster(false);
//   mockie.mockThinkCluster({agent:true,isAgent:undefined});
//   mockie.mockThinkMockHttp();
//   const App = getApplication();
//   let app = new App(defaultOption);
//   app.parseArgv = ()=>{return {}};
//   app.run();
// })

test.serial('parseArgv with empty args', t => {
  const App = getApplication();
  let app = new App(defaultOption);
  process.argv[2] = '';
  const result = app.parseArgv();
  t.deepEqual(result,{});
})

test.serial('run with port args', t => {
  const App = getApplication();
  let app = new App(defaultOption);
  process.argv[2] = '8360';
  const result = app.parseArgv();
  t.deepEqual(result,{port:'8360'});
})
