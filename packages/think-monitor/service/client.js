const send = require('./send');
const cluster = require('cluster');
const os = require('os');

var isMaster = cluster.isMaster;

var status = 'OK';

endCallback = ()=>{
  if(status === 'ERROR') {
    status = 'OK';
    console.log(`start monitoring on pid: ${process.pid}`);
  }
}
errorCallback = ()=>{
  if(status === 'OK') {
    status = 'ERROR';
    console.log(`warning: pid ${process.pid} send metrics failed, this warning will be notice only once unless your monitor server is back.`);
  }
}



module.exports = function({hash, port=3000, interval=1000, batch=10}) {
  var host = os.hostname();
  var pid = process.pid;
  var cpuUsage = process.cpuUsage();
  var data = {hash, host, pid, points: [], is_master: isMaster};
  var time = Date.now();
  setInterval(()=>{
    var time_diff = Date.now() - time;
    time+= time_diff;

    var diffCpuUsage = process.cpuUsage(cpuUsage);
    cpuUsage = process.cpuUsage();
    var {rss, heapUsed, heapTotal, external} = process.memoryUsage();
    var metric = {
      cpu_user: diffCpuUsage.user,
      cpu_system: diffCpuUsage.system,
      rss,
      heap_used: heapUsed,
      heap_total: heapTotal,
      external: external,
      timestamp: (new Date()).valueOf()  * 1000000,
      time_diff
    };
    data.points.push(metric);
    if(data.points.length === batch) {
      send(data, port, endCallback, errorCallback);
      data.points = [];
    }
  }, interval);
}