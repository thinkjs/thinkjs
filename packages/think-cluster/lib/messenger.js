const events = require('events');
const cluster = require('cluster');
/**
 * messager class
 */
class Messager extends events {
  /**
   * get target workers
   * @param {String} target 
   */
  getTargetWorkers(target){
    let workers = Object.keys(cluster.workers).map(id => cluster.workers[id]);
    switch(target){
      case 'app':
        workers = workers.filter(item => !item.isAgent);
        break;
      case 'agent':
        workers = workers.filter(item => item.isAgent);
        break;
      case 'random':
        workers = workers.filter(item => !item.isAgent);
        let index = Math.floor(Math.random() * workers.length);
        workers = workers[index];
        break;
    }
    return workers;
  }
  /**
   * receive message from master
   */
  listen(){
    if(cluster.isMaster){
      cluster.on('message', (worker, msg) => {
        if(!msg) return;
        if(msg.type === 'messager' && msg.action){
          let workers = this.getTargetWorkers(msg.target);
          workers.forEach(worker => {
            worker.send({
              type: 'messager',
              action: msg.action,
              data: msg.data
            });
          })
        }
      });
    }else{
      process.on('message', msg => {
        if(!msg) return;
        if(msg.type === 'messager' && msg.action){
          this.emit(msg.action, msg.data);
        }
      });
    }
  }
  /**
   * send to app worker
   * @param {String} action 
   * @param {Mixed} data 
   */
  sendToApp(action, data){
    process.send({
      action,
      type: 'messager',
      target: 'app',
      data
    });
  }
  /**
   * send to agent worker
   * @param {String} action 
   * @param {Mixed} data 
   */
  sendToAgent(action, data){
    process.send({
      action,
      type: 'messager',
      target: 'agent',
      data
    })
  }
  /**
   * send to random worker
   * @param {String} action 
   * @param {Mixed} data 
   */
  sendToRandom(action, data){
    process.send({
      action,
      type: 'messager',
      target: 'random',
      data
    });
  }
  /**
   * send to app worker & agent worker
   * @param {String} action 
   * @param {Mixed} data 
   */
  broadcast(action, data){
    process.send({
      action,
      type: 'messager',
      target: 'broadcast',
      data
    });
  }
}

module.exports = Messager;