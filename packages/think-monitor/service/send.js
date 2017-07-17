const http = require('http');

module.exports = function(data, endCallback=new Function, errorCallback=new Function) {
  data = JSON.stringify(data);

  var options = {
    hostname: 'localhost',
    port: 3000,
    path: '/add',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  var req = http.request(options, (res) => {
    if(res.statusCode != 200) {
      console.log('write failed');
    }
    // if(endCallback) {
    //   res.on('end', endCallback);
    // }
  });

  if(errorCallback) {
    req.on('error', errorCallback);
  }

  if(endCallback) {
    req.on('finish', endCallback);
  }

  req.setTimeout(300);

  req.write(data);
  req.end();

}