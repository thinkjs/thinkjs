try {
  const cluster = require('cluster');
  const http = require('http');

  let options = {
    workers: 1,
    // reloadSignal: 'SIGUSR2',
    // enableAgent: false
  };
  let ClusterMaster = require('../../index').Master;
  if (cluster.isMaster) {
    let instance = new ClusterMaster(options);
    instance.forkWorkers().then(() => {
      let result = {
        isForked:true
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
