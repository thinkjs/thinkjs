const mock = require('mock-require');

function mockThinkMockHttp() {
  mock('think-mock-http', ()=> {
  })
}

function mockCluster(isMaster){
  mock('cluster',{
    isMaster,
    workers:[],
    on(evtName,cb){
      this[evtName] = cb;
    },
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
  })
}

function mockThinkCluster(isAgent){
  mock('think-cluster',{
    isAgent(){
      return isAgent
    },
    Master:class Master{},
    Agent:class Agent{
      createServer(){
        require('think-cluster').createdServer = true;
      }
    }
  })
}

function stop(name){
  if(!name){
    mock.stopAll()
  }
  mock.stop(name);
}


module.exports = {
  mockThinkMockHttp,
  mockCluster,
  mockThinkCluster,
  stop
}