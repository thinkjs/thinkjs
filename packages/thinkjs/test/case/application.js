const {test, afterEach} = require('node:test');
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

afterEach(() => {
  mockie.stop();
});

test('normal test', t => {
  mockie.mockCluster(true);
  mockie.mockThinkCluster();
  mockie.mockThinkMockHttp();
  const App = getApplication();
  let app = new App(defaultOption);
  app.run();
  t.assert.strictEqual(think.isCli, undefined)
})

test('runInMaster', t => {
  mockie.mockCluster(true);
  mockie.mockThinkCluster();
  mockie.mockThinkMockHttp();
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}}
  app.run();
  console.log('app.masterInstance', app.masterInstance)
  t.assert.strictEqual(app.masterInstance instanceof require('think-cluster').Master,false)
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

test('runInWorker', async t => {
  mockie.mockCluster(false);
  mockie.mockThinkCluster({isFirstWorker:()=>{return true}});
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {}};
  //think.isCli = false
  const nodeEnv = process.env.NODE_ENV;
  delete process.env.NODE_ENV;
  app.run();
  process.env.NODE_ENV = nodeEnv;
  await utils.sleep(1000)
  // console.log(think.Controller.toString());
  t.assert.strictEqual(require('think-cluster').capturedEvents,true)
})

test('runInWorker with createServerFn ', async t => {
  mockie.mockCluster(false);
  mockie.mockThinkCluster({isFirstWorker:()=>{return true}});
  const App = getApplication();
  const option = Object.assign({},defaultOption,{APP_PATH: path.resolve(__dirname,'../runtime')});
  let app = new App(option);
  app.parseArgv = ()=>{return {}};
  const nodeEnv = process.env.NODE_ENV;
  delete process.env.NODE_ENV;
  app.run();
  process.env.NODE_ENV = nodeEnv;
  await utils.sleep(1000)
  t.assert.strictEqual(require('think-cluster').capturedEvents,true)
})

test('runInWorker with non-first worker', async t => {
  mockie.mockCluster(false);
  mockie.mockThinkCluster({isFirstWorker:()=>{return false}});
  const App = getApplication();
  let app = new App(defaultOption);
  app.parseArgv = ()=>{return {port:8361}};
  const nodeEnv = process.env.NODE_ENV;
  delete process.env.NODE_ENV;
  app.run();
  process.env.NODE_ENV = nodeEnv;
  await utils.sleep(1000)
  t.assert.strictEqual(require('think-cluster').capturedEvents,true)
})

test('watcher', t => {
  mockie.mockCluster(true);
  mockie.mockThinkCluster();
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
  t.assert.strictEqual(think.isCli, undefined)
})

test('_watcherCallBack', t => {
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

test('_watcherCallBack with non-logger', t => {
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

test('_watcherCallBack with non-array transpiler and throw error', t => {
  const App = getApplication();
  const babel = (options)=> {
    return new Error('test error')
  };
  const option = Object.assign({}, defaultOption, {
    transpiler: babel
  });
  let app = new App(option);
  let result = app._watcherCallBack({path: '/', file: 'tests.js'});

  t.assert.strictEqual(result, false);
})

test('notifier', t => {
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
  t.assert.strictEqual(result.message,'test error');
})

test('notifier with non-array options', t => {
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
  t.assert.strictEqual(result.message,'test error');
})

test('_watcherCallBack with masterInstance', t => {
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
  t.assert.strictEqual(app.masterInstance instanceof require('think-cluster').Master, false);
})

test('run with pm2 cluster mode', t => {
  mockie.mockThinkPm2({isClusterMode:true});
  const App = getApplication();
  const app = new App(defaultOption);
  let err = null;
  try{
    app.run();
  }catch(e){
    err = e;
  }
  t.assert.strictEqual(err instanceof Error,true);
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

test('parseArgv with empty args', t => {
  const App = getApplication();
  let app = new App(defaultOption);
  process.argv[2] = '';
  const result = app.parseArgv();
  t.assert.deepStrictEqual(result,{});
})

test('run with port args', t => {
  const App = getApplication();
  let app = new App(defaultOption);
  process.argv[2] = '8360';
  const result = app.parseArgv();
  t.assert.deepStrictEqual(result,{port:'8360'});
})

test('unlink reloads workers without transpiling removed source', t => {
  const App = getApplication();
  let transpiled = 0;
  let reloaded = 0;
  const app = new App({ROOT_PATH: __dirname, transpiler: () => transpiled++});
  app.masterInstance = {forceReloadWorkers: () => reloaded++};
  app._watcherCallBack({path: __dirname, file: 'removed.ts', event: 'unlink'});
  t.assert.strictEqual(transpiled, 0);
  t.assert.strictEqual(reloaded, 1);
});

test('passes emit report through before reload and retains a single closable watcher', t => {
  const App = getApplication();
  let created = 0;
  let options;
  const steps = [];
  class Watcher {
    constructor(value, cb) { created++; options = value; this.cb = cb; }
    watch() { this.cb({path: __dirname, file: 'a.ts', onEmit: files => steps.push(files)}); }
    close() { steps.push('closed'); }
  }
  const app = new App({ROOT_PATH: __dirname, APP_PATH: path.join(__dirname, 'app'), watcher: Watcher,
    watcherOptions: {interval: 25, srcPath: '/cannot-override'},
    transpiler: config => config.onEmit(['a.js', 'a.js.map'])});
  app.masterInstance = {forceReloadWorkers: () => steps.push('reload')};
  const watcher = app.startWatcher();
  t.assert.strictEqual(app.startWatcher(), watcher);
  t.assert.strictEqual(created, 1);
  t.assert.strictEqual(options.interval, 25);
  t.assert.strictEqual(options.srcPath, path.join(__dirname, 'src'));
  t.assert.deepStrictEqual(steps, [['a.js', 'a.js.map'], 'reload']);
  app.watcherInstance.close();
  t.assert.strictEqual(steps.at(-1), 'closed');
});

test('tracked transpiler failures never reload workers', t => {
  const App = getApplication();
  for (const result of [false, new Error('failed'), Promise.reject(new Error('unsupported async'))]) {
    const app = new App({ROOT_PATH: __dirname, transpiler: () => result});
    let reloaded = false;
    app.masterInstance = {forceReloadWorkers: () => { reloaded = true; }};
    t.assert.strictEqual(app._watcherCallBack({path: __dirname, file: 'a.ts', onEmit() {}}), false);
    t.assert.strictEqual(reloaded, false);
  }
});

test('startWatcher restarts a closed retained watcher', t => {
  const App = getApplication();
  const app = new App({ROOT_PATH: __dirname, watcher: class {}});
  let calls = 0;
  const watcher = {closed: true, watch() { this.closed = false; calls++; }};
  app.watcherInstance = watcher;
  t.assert.strictEqual(app.startWatcher(), watcher);
  app.startWatcher();
  t.assert.strictEqual(calls, 1);
});

test('initial watcher failure retains a closed instance and its output ledger for retry', t => {
  const App = getApplication();
  let created = 0;
  class Watcher {
    constructor() { created++; this.closed = false; this.failed = false; }
    watch() {
      this.closed = false;
      if (!this.failed) { this.failed = true; this.closed = true; throw new Error('initial emit failed'); }
    }
  }
  const app = new App({ROOT_PATH: __dirname, watcher: Watcher});
  t.assert.throws(() => app.startWatcher(), /initial emit failed/);
  const retained = app.watcherInstance;
  t.assert.strictEqual(app.startWatcher(), retained);
  t.assert.strictEqual(created, 1);
  t.assert.strictEqual(retained.closed, false);
});
