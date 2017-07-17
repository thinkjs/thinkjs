const influx = require('./influx');

influx.read().then(data=>{
  console.log(data)
});