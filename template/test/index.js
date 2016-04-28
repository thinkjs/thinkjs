'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var http = require('http');

var thinkjs = require('thinkjs');
var ROOT_PATH = path.dirname(__dirname);
thinkjs.load({
  ROOT_PATH: ROOT_PATH,
  APP_PATH: ROOT_PATH + think.sep + 'app',
  RUNTIME_PATH: ROOT_PATH + think.sep + 'runtime',
  RESOURCE_PATH: ROOT_PATH + think.sep + 'www'
});


//get http object
var getHttp = function(options){
  var req = new http.IncomingMessage();
  req.headers = { 
    'host': 'www.thinkjs.org',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit',
  };
  req.method = 'GET';
  req.httpVersion = '1.1';
  req.url = '/index/index';
  var res = new http.ServerResponse(req);
  res.write = function(){
    return true;
  }

  return think.http(req, res).then(function(http){
    if(options){
      for(var key in options){
        http[key] = options[key];
      }
    }
    return http;
  })
}

describe('unit test', function(){
  it('test controller', function(done){
    getHttp().then(function(http){
      var instance = think.controller('index', http, 'home');
      /**
       * instance.xxx().then(function(){
       *   //done();
       * })
       */
      done();
    })
  })

  it('test model', function(done){
    var dbConfig = think.config('db');
    //get model instance
    var instance = think.model('user', dbConfig, 'home');
    /**
     * instance.xxx().then(function(data){
     *   assert.deepEqual(data, {});
     *   //done();
     * })
     */
    done();
  })
});