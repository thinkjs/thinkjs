var assert = require('assert');
var path = require('path');
var fs = require('fs');
var http = require('http');

var thinkjs = require('thinkjs');
var instance = new thinkjs();
instance.load();


var Class = require('../lib/index.js');


// var getHttp = function(options){
//   var req = new http.IncomingMessage();
//   req.headers = { 
//     'host': 'www.thinkjs.org',
//     'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit',
//   };
//   req.method = 'GET';
//   req.httpVersion = '1.1';
//   req.url = '/index/index';
//   var res = new http.ServerResponse(req);
//   res.write = function(){
//     return true;
//   }

//   return think.http(req, res).then(function(http){
//     if(options){
//       for(var key in options){
//         http[key] = options[key];
//       }
//     }
//     return http;
//   })
// }

// var execMiddleware = function(options){
//   return getHttp(options).then(function(http){
//     var instance = new Class(http);
//     return instance.run();
//   })
// }


describe('<PLUGIN_NAME>', function(){
  it('test sync', function(){

  })
  it('test async', function(done){
    Promise.resolve().then(function(){
      done();
    })
  })
})