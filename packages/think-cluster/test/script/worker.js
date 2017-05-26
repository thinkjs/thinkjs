const cluster = require('cluster');
const http = require('http');
let ClusterMaster = require('../../index').Master;
let ClusterWorker = require('../../index').Worker;

let mockServer = {
  on:(evtName)=>{
    console.log(evtName);
  }
};
const defaultOption = {
  onUncaughtException:(err)=>{
    console.log('onUncaughtException');
  },
  onUnhandledRejection:(err)=>{
    console.log('onUnhandledRejection');
  },
  server:mockServer
};

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
let opt = Object.assign({}, defaultOption,JSON.parse(process.argv[3]));
let functionName = process.argv[2];



function eachWorker(callback) {
  for (let id in cluster.workers) {
    callback(cluster.workers[id]);
  }
}

let app = {
  unHandleRejection: (options) => {
    try {
      if (cluster.isMaster) {
        let instance = new ClusterMaster(options);
        instance.forkWorkers().then(() => {
          let workers = [];
          eachWorker((worker) => {
            workers.push(worker.process.pid);
          });
          let result = {
            options,
            workers,
            isForked: true
          };
          console.log(JSON.stringify(result));
        });
      } else {
        let workerInstance = new ClusterWorker(options);
        workerInstance.captureEvents();
        sleep(3000).then(()=>{
          xxx();
        });
        http.Server((req, res) => {
          res.writeHead(200);
          res.end('hello world\n');
          process.send({cmd: 'notifyRequest'});
        }).listen(8000);
      }
    } catch (e) {
      console.log(e);
    }
  },
  unCaughtException:(options)=>{
    try {
      if (cluster.isMaster) {
        let instance = new ClusterMaster(options);
        instance.forkWorkers().then(() => {
          let workers = [];
          eachWorker((worker) => {
            workers.push(worker.process.pid);
          });
          let result = {
            options,
            workers,
            isForked: true
          };
          console.log(JSON.stringify(result));
        });
      } else {
        let workerInstance = new ClusterWorker(options);
        workerInstance.captureEvents();
        setTimeout(()=>{
          xxx();
        },3000)
        http.Server((req, res) => {
          res.writeHead(200);
          res.end('hello world\n');
          process.send({cmd: 'notifyRequest'});
        }).listen(8000);
      }
    } catch (e) {
      console.log(e);
    }
  }
};
app[functionName](opt);
