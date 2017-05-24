try {
  const cluster = require('cluster');
  const http = require('http');

  // function eachWorker(callback) {
  //   for (const id in cluster.workers) {
  //     callback(cluster.workers[id]);
  //   }
  // }

  let options = Object.assign({}, JSON.parse(process.argv[2]));
  let ClusterMaster = require('../../index').Master;
  let ClusterWorker = require('../../index').Worker;

  if (cluster.isMaster) {
    let instance = new ClusterMaster(options);
    instance.forkWorkers().then(() => {
      let result = {
        options,
        isForked: true
      };
      // eachWorker((worker)=>{
      //   worker.on('message',(msg)=>{
      //     console.log(msg);
      //   })
      // });
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
