const test = require('ava');
const mock = require('mock-require');
const path = require('path');
const helper = require('think-helper');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function getWorker() {
  return mock.reRequire('../../lib/worker');
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
            cb('test address')
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
        send(signal){
          // console.log(signal);
        },
        kill(){
          // this.isKilled = true;
        },
        isConnected(){
          return !this.isKilled;
        },
        process:{
          kill:()=>{
            worker.isKilled = true;
          }
        }
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

const defaultConfig = {
  server:{
    address:'http://localhost:8080'
  },
  onUnhandledRejection:(e)=>{
    console.log(e);
  }
};

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

test.serial('normal case', async t => {
  const cluster = require('cluster');
  const Worker = getWorker();
  let instance = new Worker(defaultConfig);
  instance.captureEvents();

  new Promise((resolve, reject) => {
    throw new Error('test')
  })
});
