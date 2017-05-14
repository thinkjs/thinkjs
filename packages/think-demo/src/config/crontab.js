module.exports = [{
  interval: '1s',
  type: 'all',
  enable: false,
  handle: function(){
    console.log(`crontab all, pid: ${process.pid}`);
  }
}, {
  interval: '1s',
  type: 'one',
  enable: false,
  handle: function(){
    console.log(`crontab one, pid: ${process.pid}`)
  }
}]