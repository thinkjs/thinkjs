try {
  const cluster = require('cluster');
  const http = require('http');
  let options = Object.assign({}, JSON.parse(process.argv[2]));
  let ClusterMaster = require('../../index').Master;
  if (cluster.isMaster) {
    let instance = new ClusterMaster(options);
    instance.forkWorkers().then(() => {
      let result = {
        options,
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
