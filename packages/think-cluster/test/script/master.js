const cluster = require('cluster');
const http = require('http');
const ClusterMaster = require('../../index').Master;
const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const opt = Object.assign({}, JSON.parse(process.argv[3]));
const functionName = process.argv[2];

function eachWorker(callback) {
  for (const id in cluster.workers) {
    callback(cluster.workers[id]);
  }
}

const app = {
  forkWorkers: (options) => {
    try {
      if (cluster.isMaster) {
        const instance = new ClusterMaster(options);
        instance.forkWorkers().then(() => {
          const workers = [];
          eachWorker((worker) => {
            workers.push(worker.process.pid);
          });
          const result = {
            options,
            workers,
            isForked: true
          };
          console.log(JSON.stringify(result));
        });
      } else {
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
  reloadWorkers: (options) => {
    let result = {};
    try {
      if (cluster.isMaster) {
        const instance = new ClusterMaster(options);
        instance.forkWorkers().then(() => {
          const beforeWorkers = [];
          eachWorker((worker) => {
            beforeWorkers.push(worker.process.pid);
          });
          result = {
            options,
            beforeWorkers,
            isForked: true
          };
          // console.log(JSON.stringify(result));
          sleep(2000).then(() => {
            instance.forceReloadWorkers();
          });
        });
        sleep(5000).then(() => {
          const workers = [];
          eachWorker((worker) => {
            workers.push(worker.process.pid);
          });
          result.afterWorkers = workers;
          console.log(JSON.stringify(result));
        });
      } else {
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
