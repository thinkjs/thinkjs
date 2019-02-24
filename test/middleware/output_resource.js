var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var _http = require('../_http.js');

function getHttp(config, options){
  think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';
  var instance = _http.createReqRes();
  var req = instance.req;
  var res = instance.res;
  return think.http(req, res).then(function(http){
    if(config){
      http._config = config;
    }
    if(options){
      for(var key in options){
        http[key] = options[key];
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


describe('middleware/output_resource', function(){
  it('output_resource, false', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: JSON.stringify({name: 'welefen', test: 'haha'}),

       headers: {
        'content-type': 'application/json'
      }
    }).then(function(http){
      think.middleware('output_resource', http, false).then(function(data){
        assert.equal(data, undefined)
        done();
      })
    })
  })
  it('output_resource, true', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: JSON.stringify({name: 'welefen', test: 'haha'}),

      headers: {
        'content-type': 'application/json'
      }
    }).then(function(http){
      think.middleware('output_resource', http, true).catch(function(err){
        assert.equal(think.isPrevent(err), true)
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('output_resource', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: JSON.stringify({name: 'welefen', test: 'haha'}),

       headers: {
        'content-type': 'application/json'
      }
    }).then(function(http){
      think.middleware('output_resource', http, __filename).catch(function(err){
        assert.equal(think.isPrevent(err), true);
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('output_resource file not exist', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: JSON.stringify({name: 'welefen', test: 'haha'}),

       headers: {
        'content-type': 'application/json'
      }
    }).then(function(http){
      think.middleware('output_resource', http, __filename + '_____').catch(function(err){
        assert.equal(think.isError(err), true);
        done();
      })
    })
  })
  it('output_resource file, range', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: JSON.stringify({name: 'welefen', test: 'haha'}),
      headers: {
        range: 'bytes=0-',
        'content-type': 'application/json'
      },
      end: function(){},
      status: function(status){
        assert.equal(status, 206);
      }
    }).then(function(http){
      think.middleware('output_resource', http, __filename).catch(function(err){
        assert.equal(think.isPrevent(err), true)
        done();
      })
    })
  })

  it('output_resource file, range, more than max', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: JSON.stringify({name: 'welefen', test: 'haha'}),
      headers: {
        range: 'bytes=0-1000000',
        'content-type': 'application/json'
      },
      end: function(){},
      status: function(status){
        assert.equal(status, 206);
      }
    }).then(function(http){
      think.middleware('output_resource', http, __filename).catch(function(err){
        assert.equal(think.isPrevent(err), true)
        done();
      })
    })
  })
})