module.exports = [{
  interval: '1s',
  type: 'all',
  handle: function(){
    //console.log(`crontab all, pid: ${process.pid}`);
  }
}, {
  interval: '1s',
  type: 'one',
  handle: function(){
    //console.log(`crontab one, pid: ${process.pid}`)
  }
}]