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
  it('parse_querystring_payload,readable', function(done){
    getHttp('', {
      payload: '',
      req: {readable: false}
    }).then(function(http){
      think.middleware('parse_querystring_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {});
        done();
      })
    })
  })
  it('parse_querystring_payload, has _post data', function(done){
    getHttp('', {
      payload: '',
      _post: {name: 'thinkjs'},
      getPayload: function(){
        return Promise.resolve('')
      }
    }).then(function(http){
      think.middleware('parse_querystring_payload', http).then(function(data){
        assert.deepEqual(http._post, {name: 'thinkjs'});
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  it('parse_querystring_payload, getPayload, contentType fail', function(done){
    getHttp('', {
      payload: '',
      type: function(){return 'content'},
      //_post: {name: 'thinkjs'},
      getPayload: function(){
        return Promise.resolve('name=thinkjs1')
      }
    }).then(function(http){
      think.middleware('parse_querystring_payload', http).then(function(data){
        assert.deepEqual(http._post, {});
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  it('parse_querystring_payload, getPayload, contentType empty', function(done){
    getHttp('', {
      payload: '',
      //_post: {name: 'thinkjs'},
      getPayload: function(){
        return Promise.resolve('name=thinkjs1')
      }
    }).then(function(http){
      think.middleware('parse_querystring_payload', http).then(function(data){
        assert.deepEqual(http._post, {name: 'thinkjs1'});
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  it('parse_querystring_payload, getPayload', function(done){
    getHttp('', {
      payload: '',
      type: function(){
        return 'application/x-www-form-urlencoded'
      },
      //_post: {name: 'thinkjs'},
      getPayload: function(){
        return Promise.resolve('name=thinkjs1')
      }
    }).then(function(http){
      think.middleware('parse_querystring_payload', http).then(function(data){
        assert.deepEqual(http._post, {name: 'thinkjs1'});
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
})