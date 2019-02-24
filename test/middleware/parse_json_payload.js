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
  var instance = _http.createReqRes();
  var req = instance.req;
  var res = instance.res;
  req.readable = true;

  // var res = think.extend({}, _http.res);
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
  it('parse_json_payload, readable false', function(done){
    getHttp('', {
      payload: '',
      req: {readable: false}
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {});
        done();
      })
    })
  })
  it('parse_json_payload, content-type fail', function(done){
    getHttp('', {
      payload: JSON.stringify({name: 'welefen'}),
      req: {readable: true},
      headers: {
        'content-type': 'application/json111'
      }
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {});
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  it('parse_json_payload, has json string', function(done){
    getHttp('', {
      payload: JSON.stringify({name: 'welefen'}),
      req: {readable: true},
      headers: {
        'content-type': 'application/json'
      }
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {name: 'welefen'});
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  // it('parse_json_payload, has json string, emtpy', function(done){
  //   getHttp('', {
  //     payload: '',
  //    // req: {readable: true},
  //     headers: {
  //       'content-type': 'application/json'
  //     }
  //   }).then(function(http){
  //     think.middleware('parse_json_payload', http).then(function(data){
  //       assert.equal(data, undefined);
  //       assert.deepEqual(http._post, {name: 'welefen'});
  //       done();
  //     }).catch(function(err){
  //       console.log(err.stack)
  //     })
  //   })
  // })
  it('parse_json_payload, has json string, not valid', function(done){
    getHttp('', {
      payload: 'name=welefen1',
      req: {readable: true},
      headers: {
        'content-type': 'application/json'
      }
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {name: 'welefen1'});
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  it('parse_json_payload empty', function(done){
    getHttp('', {
      payload: ''
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {});
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('parse_json_payload, empty content-type', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: 'welefen'
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {});
        done();
      })
    })
  })
  it('parse_json_payload, has content-type, but payload is querystring', function(done){
    getHttp({
      post: {
        json_content_type: ['application/json']
      },
    }, {
      payload: 'welefen=suredy',
      headers: {
        'content-type': 'application/json'
      }
    }).then(function(http){
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {welefen: 'suredy'});
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('parse_json_payload, has payload', function(done){
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
      think.middleware('parse_json_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {name: 'welefen', test: 'haha'});
        done();
      })
    })
  })
})