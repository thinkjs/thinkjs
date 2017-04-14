const cluster = require('cluster');
const isMaster = cluster.isMaster;

const MESSENGER = 'think-messenger-broadcast';

module.exports = function(app){
  if(isMaster){
    process.on('message', message => {
      if(message && message.act === MESSENGER){
        for(let id in cluster.workers){
          let worker = cluster.workers[id];
          if(worker.isAgent) continue;
          worker.send(message);
        }
      }
    });
  }else{
    process.on('message', message => {
      if(message && message.act === MESSENGER){
        app.emit(message.action, message.data);
      }
    });
  }
  return {
    broadcast(action, data){
      process.send({act: MESSENGER, action, data});
    }
  }
}