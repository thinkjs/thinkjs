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
//
// const defaultConfig = {
//   server:{
//     address:'http://localhost:8080'
//   },
//   onUnhandledRejection:(e)=>{
//     console.log('aaaa');
//   }
// };

function mockAssert(assertCallParams = []) {
  mock('assert', (type, desc) => {
    assertCallParams.push(type, desc);
  });
}

test.serial('normal case', async t => {
  let unhandledRejectionDid = false;
  const config = {
    server:{
      address:'http://localhost:8080'
    },
    onUnhandledRejection:(e)=>{
      unhandledRejectionDid = true;
    }
  };
  const cluster = require('cluster');
  const Worker = getWorker();
  let instance = new Worker(config);
  instance.captureEvents();

  const loudRejection = require('loud-rejection')

  loudRejection()

  let myp

  setTimeout(function () {
    myp = new Promise(function (resolve, reject) {
      setTimeout(reject, 100, new Error('Silence me'))
    })
  }, 100)
  setTimeout(function () {
    myp.catch(function (err) {
      t.is(unhandledRejectionDid,true)
    })
  }, 300)
  await sleep(2000)
});
