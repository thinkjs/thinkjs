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

describe('middleware/parse_single_file_payload', function(){
  it('parse_single_file_payload, readable false', function(done){
    getHttp('', {
      payload: '',
      req: {readable: false}
    }).then(function(http){
      think.middleware('parse_single_file_payload', http).then(function(data){
        assert.equal(data, undefined);
        http.req.readable = true;
        assert.deepEqual(http._post, {});
        done();
      })
    })
  })
  it('parse_single_file_payload, single_file_header header unset', function(done){
    getHttp('', {
      payload: '',
      //_post: {name: 'thinkjs'},
      getPayload: function(){
        return Promise.resolve('name=thinkjs1')
      }
    }).then(function(http){
      var postConfig = http.config('post');
      var header = postConfig['single_file_header'];
      muk(postConfig, 'single_file_header', '');
      think.middleware('parse_single_file_payload', http).then(function(data){
        muk.restore();
        postConfig.single_file_header = header;
        assert.equal(data, undefined)
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  it('parse_single_file_payload', function(done){
    getHttp('', {
      payload: '',
      req: {
        pipe: function(stream){
          setTimeout(function(){
            stream.emit('close');
          }, 10)
        }
      },
      headers: {
        'x-filename': 'image'
      },
      getPayload: function(){
        return Promise.resolve('name=thinkjs1')
      }
    }).then(function(http){
      think.middleware('parse_single_file_payload', http).then(function(data){
        assert.equal(think.isObject(http._file.file), true)
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('parse_single_file_payload, change upload file', function(done){
    getHttp('', {
      payload: '',
      req: {
        pipe: function(stream){
          setTimeout(function(){
            stream.emit('close');
          }, 10)
        }
      },
      headers: {
        'x-filename': 'image'
      },
      getPayload: function(){
        return Promise.resolve('name=thinkjs1')
      }
    }).then(function(http){
      var postConfig = think.config('post');
      muk(postConfig, 'file_upload_path', '');

      think.middleware('parse_single_file_payload', http).then(function(data){
        assert.equal(think.isObject(http._file.file), true);
        assert.equal(http._file.file.path.indexOf(think.sep + 'thinkjs' + think.sep + 'upload')> -1, true)
        muk.restore();
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  it('parse_single_file_payload, has error', function(done){
    getHttp('', {
      payload: '',
      end: function(){

      },
      req: {
        pipe: function(stream){
          //
          setTimeout(function(){
            stream.emit('close');
          }, 10);
          setTimeout(function(){
            stream.emit('error');
          }, 30)
        },
        
      },
      headers: {
        'x-filename': 'image'
      },
      res: {
        statusCode: 200
      },
      getPayload: function(){
        return Promise.resolve('name=thinkjs1')
      }
    }).then(function(http){
      think.middleware('parse_single_file_payload', http).then(function(data){
        assert.equal(think.isObject(http._file.file), true)
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    })
  })
  it('parse_single_file_payload, has error 1', function(done){
    getHttp('', {
      payload: '',
      end: function(){

      },
      req: {
        pipe: function(stream){
          //
          setTimeout(function(){
            stream.emit('error');
          }, 30)
        },
        
      },
      headers: {
        'x-filename': 'image'
      },
      res: {
        statusCode: 200
      },
      getPayload: function(){
        return Promise.resolve('name=thinkjs1')
      }
    }).then(function(http){
      http.end = function(){
        done();
      }
      think.middleware('parse_single_file_payload', http);
    })
  })
})