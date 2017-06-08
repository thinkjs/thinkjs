const test = require('ava');
const mock = require('mock-require');
const path = require('path');
const helper = require('think-helper');


function getMaster() {
  return mock.reRequire('../../lib/master');
}

// test.afterEach.always(() => {
//   mock.stop('cluster');
// });

function mockCluster(){
  mock('cluster',{
    workers:[],
    fork(env={}){
      let worker = {
        on(evtName,cb){
          this[evtName] = cb;
        },
        once(evtName,cb){
          this.on(evtName,cb)
          if(evtName === 'listening') {
            cb()
          }
        },
        trigger(evtName,args){
          const cluster = require('cluster');
          if(evtName === 'exit'){
            let workers = Array.from(cluster.workers);
            cluster.workers.forEach((item,index)=>{
              if(item === this){
                workers.splice(index,1)
              }
            })
            cluster.workers = workers;
          }
          this[evtName](args);
        },
      };
      worker = Object.assign(worker,env);
      let cluster = require('cluster');
      cluster.workers.push(worker)
      return worker;
    },
    trigger(evtName,args){
      this.workers.forEach(worker => {
        worker.trigger(evtName,args)
      })
    }
  })
}

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  let instance = new Master();
  await instance.forkWorkers();
  cluster.trigger('message','think-graceful-disconnect');
  t.is(cluster.workers[0].hasGracefulReload,true);
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  let instance = new Master();
  await instance.forkWorkers();
  t.is(cluster.workers.length,require('os').cpus().length)
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  let instance = new Master();
  await instance.forkWorkers();
  cluster.trigger('exit');
  t.is(cluster.workers.length,require('os').cpus().length)
});

test.serial('normal case', async t => {
  mockCluster();
  const cluster = require('cluster');
  const Master = getMaster();
  let instance = new Master();
  await instance.forkWorkers({isAgent:true});
  console.log(cluster.workers);
  // cluster.trigger('exit');
  // t.is(cluster.workers.length,require('os').cpus().length)
});