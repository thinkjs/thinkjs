const mock = require('mock-require');

function mockThinkMockHttp() {
  mock('think-mock-http', ()=> {
  })
}

function mockCluster(isMaster) {
  mock('cluster', {
    isMaster,
    workers: [],
    on(evtName, cb){
      this[evtName] = cb;
    },
    fork(env = {}){
      let worker = {
        on(evtName, cb){
          this[evtName] = cb;
        },
        once(evtName, cb){
          this.on(evtName, cb)
          if (evtName === 'listening') {
            cb('test address')
          }
        },
        trigger(evtName, args){
          const cluster = require('cluster');
          if (evtName === 'exit') {
            let workers = Array.from(cluster.workers);
            cluster.workers.forEach((item, index)=> {
              if (item === this) {
                workers.splice(index, 1)
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
        process: {
          kill: ()=> {
            worker.isKilled = true;
          }
        }
      };
      worker = Object.assign(worker, env);
      let cluster = require('cluster');
      cluster.workers.push(worker)
      return worker;
    },
  })
}

function mockThinkCluster(args = {}) {
  let {agent} = args;
  let obj = Object.assign({
    isAgent(){
      return agent
    },
    Master: class Master {
      forkWorkers(){
        return Promise.resolve();
      }
      forceReloadWorkers(){
      }
      startServer(){return Promise.resolve()}
    },
    Worker: class Worker {
      constructor(options = {}){
        this.options = options;
      }
      getWorkers(){}
      captureEvents(){
        require('think-cluster').capturedEvents = true;
      }
      startServer(){ 
        this.captureEvents();
        return Promise.resolve()
      }
    },
    Agent: class Agent {
      createServer() {
        require('think-cluster').createdServer = true;
      }
    }
  }, args);

  mock('think-cluster', obj);
}

let instance = null;

function mockCookies() {
  mock('cookies', class Cookies{
    constructor(req,res,options){
      if(!instance){
        instance = this;
        instance.cookie = {};
        instance.req = req;
        instance.res = res;
        instance.options = options;
      }
      return instance;
    }
    set(name,value,options){
      this.cookie[name] = value;
    }
    get(name,options){
      return this.cookie[name] || ''
    }
  });
}

function mockThinkPm2(args = {}) {
  mock('think-pm2', args);
}

function mockConsoleError(){
  console.error = ()=>{
    console.log('test exception success')
  }
}

function mockThinkValidator(){
  mock('think-validator', class Validator{
    constructor(ctx){
      this.ctx = ctx;
    }
    validate(rules,msgs){
      return rules.mockResult
    }
    static addRule(){}
  });
}

function stop(name) {
  if (!name) {
    mock.stopAll()
  }
  mock.stop(name);
}


module.exports = {
  mockThinkMockHttp,
  mockCluster,
  mockThinkCluster,
  mockThinkPm2,
  mockCookies,
  mockConsoleError,
  mockThinkValidator,
  stop
}