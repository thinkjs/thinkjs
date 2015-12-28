var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var _http = require('../_http.js');

var thinkjs = require('../../lib/index.js');

var tjs = new thinkjs();
tjs.load();

function getHttp(config, options){
  think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';
  var req = think.extend({}, _http.req);
  var res = think.extend({}, _http.res);
  return think.http(req, res).then(function(http){
    if(config){
      http._config = config;
    }
    if(options){
      for(var key in options){
        if(think.isObject(options[key])){
          http[key] = think.extend({}, http[key], options[key]);
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

describe('bootstrap/_payload.js', function(){
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
  it('parse_querystring_payload, getPayload', function(done){
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
  it('parse_single_file_payload, readable false', function(done){
    getHttp('', {
      payload: '',
      req: {readable: false}
    }).then(function(http){
      think.middleware('parse_single_file_payload', http).then(function(data){
        assert.equal(data, undefined);
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
      var postConfig = think.config('post');
      muk(postConfig, 'single_file_header', '');
      think.middleware('parse_single_file_payload', http).then(function(data){
        muk.restore();
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
        },
        headers: {
          'x-filename': 'image'
        }
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
  it('parse_single_file_payload, change upload file', function(done){
    getHttp('', {
      payload: '',
      req: {
        pipe: function(stream){
          setTimeout(function(){
            stream.emit('close');
          }, 10)
        },
        headers: {
          'x-filename': 'image'
        }
      },
      getPayload: function(){
        return Promise.resolve('name=thinkjs1')
      }
    }).then(function(http){
      var postConfig = think.config('post');
      muk(postConfig, 'file_upload_path', '');

      think.middleware('parse_single_file_payload', http).then(function(data){
        assert.equal(think.isObject(http._file.file), true);
        assert.equal(http._file.file.path.indexOf(think.sep + 'thinkjs_upload')> -1, true)
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
        headers: {
          'x-filename': 'image'
        }
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