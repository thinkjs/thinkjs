const test = require('ava');
const mock = require('mock-require');
const cluster = require('cluster');
const http = require('http');
const path = require('path');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

function getClusterMaster() {
  return mock.reRequire('../index').Master;
}

test('test case', async t => {
  let scriptPath = path.join(__dirname,'script','master.js');
  const exec = require('child_process').exec;
  const child = exec(`node ${scriptPath}`,
    (error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
  await sleep(5000);
  child.kill();
  await sleep(5000);



  // let options = {
  //   workers: 1,
  //   // reloadSignal: 'SIGUSR2',
  //   // enableAgent: false
  // };
  // let ClusterMaster = getClusterMaster();
  // if(cluster.isMaster){
  //   let instance = new ClusterMaster(options);
  //   instance.forkWorkers().then(()=>{console.log(1)});
  // }else{
  //   console.log('worker running');
  //   try {
  //     http.Server((req, res) => {
  //       res.writeHead(200);
  //       res.end('hello world\n');
  //       process.send({cmd: 'notifyRequest'});
  //     }).listen(8000);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  // await sleep(5000);
});



// let options = {
//   workers: 1,
//   // reloadSignal: 'SIGUSR2',
//   // enableAgent: false
// };
// let ClusterMaster = getClusterMaster();
// if(cluster.isMaster){
//   let instance = new ClusterMaster(options);
//   instance.forkWorkers().then(()=>{console.log(1)});
// }else{
//   console.log('worker running');
//   try {
//     http.Server((req, res) => {
//       res.writeHead(200);
//       res.end('hello world\n');
//       process.send({cmd: 'notifyRequest'});
//     }).listen(8000);
//   } catch (e) {
//     console.log(e);
//   }
// }
//
