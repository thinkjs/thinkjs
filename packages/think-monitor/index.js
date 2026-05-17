const express = require('express')
const bodyParser = require('body-parser');
const influx = require('./service/influx');
const schedule = require('node-schedule');
var cors = require('cors');
const path = require('path');

const app = express();

const port = 3000;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const registerApps = {
  '7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e': {id: 1, points: []}
}

app.post('/add', function (req, res) {
  var body = req.body;
  var {hash, host, pid, is_master, points} = body;
  var registerApp = registerApps[body.hash];
  if(!registerApp) return res.sendStatus(401);
  var hash = registerApp.id;
  points.forEach(point=>{
    point.hash = hash;
    point.host = host;
    point.pid = pid;
    point.is_master = is_master;
  });
  registerApp.points.push.apply(registerApp.points, points);
  res.sendStatus(200);
})

app.get("/process", cors(), function(req, res) {
  influx.read(req.query).then(data=>{
    res.send(data);
  });
});

app.get("/host", cors(), function(req, res) {
  influx.readHost(req.query).then(data=>{
    res.send(data);
  });
});

app.get(/^\/monitor(\/?).*$/, cors(), function(req, res) {
  res.sendFile( path.join(__dirname, 'web/monitor.html') );
});


app.get(/^(.+)$/, function(req, res){
   console.log('static file request : ' + req.params);
   res.sendFile( __dirname + req.params[0]);
});

app.listen(port, function () {
  setInterval(function(){
    Object.keys(registerApps).forEach(appKey=>{
      var app = registerApps[appKey];
      influx.write(app.points);
    });
  }, 5000)
  console.log(`Example app listening on port ${port}!`)
})

