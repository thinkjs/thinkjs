var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var multiparty = require('multiparty');


var _http = require('../_http.js');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();


function getHttp(config, options){
  think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';
  var req = think.extend({}, _http.req);
  req.readable = true;
  req.headers['content-type'] = 'application/json'

  var res = think.extend({}, _http.res);
  return think.http(req, res).then(function(http){
    if(config){
      http._config = config;
    }
    if(options){
      for(var key in options){
        if(think.isObject(http[key])){
          http[key] = think.extend(http[key], options[key]);
        }else{
          http[key] = options[key];
        }
      }
    }
    return http;
  })
}

function execMiddleware(middleware, config, options, data){
  return getHttp(config, options).then(function(http){
    return think.middleware(middleware, http, data);
  }) 
}

describe('middleware/parse_json_payload', function(){
  
  it('validate_payload', function(done){
    getHttp('', {
      _post: {name: 1, value: 2}
    }).then(function(http){
      think.middleware('validate_payload', http).then(function(data){
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  it('validate_payload, max_fields', function(done){
    getHttp('', {
      _post: {name: 1, value: 2},
      end: function(){}
    }).then(function(http){
      var postConfig = think.config('post');
      muk(postConfig, 'max_fields', 1);
      think.middleware('validate_payload', http).catch(function(err){
        muk.restore();
        done();
      })
    })
  })
  it('validate_payload, max_fields_size', function(done){
    getHttp('', {
      _post: {name: 1, value: 'fasdfasdfasdf'},
      end: function(){}
    }).then(function(http){
      var postConfig = think.config('post');
      muk(postConfig, 'max_fields_size', 2);
      think.middleware('validate_payload', http).catch(function(err){
        muk.restore();
        done();
      })
    })
  })
})