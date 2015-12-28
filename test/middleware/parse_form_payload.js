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

describe('middleware/parse_form_payload', function(){
  it('parse_form_payload,readable false', function(done){
    getHttp('', {
      payload: '',
      req: {readable: false}
    }).then(function(http){
      think.middleware('parse_form_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {});
        done();
      })
    })
  })
  it('parse_form_payload content-type not match', function(done){
    getHttp('', {
      payload: ''
    }).then(function(http){
      think.middleware('parse_form_payload', http).then(function(data){
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
  it('parse_form_payload content-type match', function(done){
    getHttp('', {
      payload: '',
      headers: {
        'content-type': 'multipart/form-data;boundary="123456789"'
      }
    }).then(function(http){
      muk(multiparty, 'Form', function(options){
        assert.equal(options.maxFieldsSize, 2097152);
        assert.equal(options.maxFields, 100);
        assert.equal(options.maxFilesSize, 1073741824);
        assert.equal(options.uploadDir.indexOf(think.sep + 'runtime' + think.sep + 'upload') > -1, true);
        return {
          on: function(type, callback){
            if(type === 'close'){
              setTimeout(function(){
                callback && callback();
              }, 20)
            }
          },
          parse: function(){

          }
        }
      })
      think.middleware('parse_form_payload', http).then(function(data){
        assert.equal(data, undefined);
        assert.deepEqual(http._post, {});

        muk.restore();
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('parse_form_payload content-type match, file', function(done){
    getHttp('', {
      payload: '',
      headers: {
        'content-type': 'multipart/form-data;boundary=123456789'
      }
    }).then(function(http){
      var multiparty = require('multiparty');
      muk(multiparty, 'Form', function(options){
        assert.equal(options.maxFieldsSize, 2097152);
        assert.equal(options.maxFields, 100);
        assert.equal(options.maxFilesSize, 1073741824);
        assert.equal(options.uploadDir.indexOf(think.sep + 'runtime' + think.sep + 'upload') > -1, true);
        return {
          on: function(type, callback){
            if(type === 'close'){
              setTimeout(function(){
                callback && callback();
              }, 20)
            }else if(type === 'file'){
              callback && callback('image', {name: 'image'})
            }
          },
          parse: function(){

          }
        }
      })
      think.middleware('parse_form_payload', http).then(function(data){
        assert.deepEqual(http._file, { image: { name: 'image' } })

        muk.restore();
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('parse_form_payload content-type match, multi file', function(done){
    getHttp('', {
      payload: '',
      headers: {
        'content-type': 'multipart/form-data;boundary=123456789'
      }
    }).then(function(http){
      var multiparty = require('multiparty');
      muk(multiparty, 'Form', function(options){
        assert.equal(options.maxFieldsSize, 2097152);
        assert.equal(options.maxFields, 100);
        assert.equal(options.maxFilesSize, 1073741824);
        assert.equal(options.uploadDir.indexOf(think.sep + 'runtime' + think.sep + 'upload') > -1, true);
        return {
          on: function(type, callback){
            if(type === 'close'){
              setTimeout(function(){
                callback && callback();
              }, 20)
            }else if(type === 'file'){
              callback && callback('image', {name: 'image'});
              callback && callback('image', {name: 'image1'})
            }
          },
          parse: function(){

          }
        }
      })
      think.middleware('parse_form_payload', http).then(function(data){
        assert.deepEqual(http._file, { image: [{ name: 'image' }, {name: 'image1'}] })

        muk.restore();
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('parse_form_payload content-type match, multi file 1', function(done){
    getHttp('', {
      payload: '',
      headers: {
        'content-type': 'multipart/form-data;boundary=123456789'
      }
    }).then(function(http){
      var multiparty = require('multiparty');
      muk(multiparty, 'Form', function(options){
        assert.equal(options.maxFieldsSize, 2097152);
        assert.equal(options.maxFields, 100);
        assert.equal(options.maxFilesSize, 1073741824);
        assert.equal(options.uploadDir.indexOf(think.sep + 'runtime' + think.sep + 'upload') > -1, true);
        return {
          on: function(type, callback){
            if(type === 'close'){
              setTimeout(function(){
                callback && callback();
              }, 20)
            }else if(type === 'file'){
              callback && callback('image', {name: 'image'});
              callback && callback('image', {name: 'image1'});
              callback && callback('image', {name: 'image2'})
            }
          },
          parse: function(){

          }
        }
      })
      think.middleware('parse_form_payload', http).then(function(data){
        assert.deepEqual(http._file, { image: [{ name: 'image' }, {name: 'image1'}, {name: 'image2'}] })

        muk.restore();
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('parse_form_payload content-type match, field', function(done){
    getHttp('', {
      payload: '',
      headers: {
        'content-type': 'multipart/form-data;boundary=123456789'
      }
    }).then(function(http){
      var multiparty = require('multiparty');
      muk(multiparty, 'Form', function(options){
        assert.equal(options.maxFieldsSize, 2097152);
        assert.equal(options.maxFields, 100);
        assert.equal(options.maxFilesSize, 1073741824);
        assert.equal(options.uploadDir.indexOf(think.sep + 'runtime' + think.sep + 'upload') > -1, true);
        return {
          on: function(type, callback){
            if(type === 'close'){
              setTimeout(function(){
                callback && callback();
              }, 20)
            }else if(type === 'file'){
              callback && callback('image', {name: 'image'});
              callback && callback('image', {name: 'image1'});
              callback && callback('image', {name: 'image2'})
            }else if(type === 'field'){
              callback && callback('name', 'thinkjs')
            }
          },
          parse: function(){

          }
        }
      })
      think.middleware('parse_form_payload', http).then(function(data){
        assert.deepEqual(http._file, { image: [{ name: 'image' }, {name: 'image1'}, {name: 'image2'}] })
        assert.deepEqual(http._post, {name: 'thinkjs'})
        muk.restore();
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('parse_form_payload content-type match, error', function(done){
    getHttp('', {
      payload: '',
      headers: {
        'content-type': 'multipart/form-data;boundary=123456789'
      },
      end: function(){

      }
    }).then(function(http){
      var multiparty = require('multiparty');
      muk(multiparty, 'Form', function(options){
        assert.equal(options.maxFieldsSize, 2097152);
        assert.equal(options.maxFields, 100);
        assert.equal(options.maxFilesSize, 1073741824);
        assert.equal(options.uploadDir.indexOf(think.sep + 'runtime' + think.sep + 'upload') > -1, true);
        return {
          on: function(type, callback){
            if(type === 'close'){
              setTimeout(function(){
                callback && callback();
              }, 20)
            }else if(type === 'file'){
              callback && callback('image', {name: 'image'});
              callback && callback('image', {name: 'image1'});
              callback && callback('image', {name: 'image2'})
            }else if(type === 'field'){
              callback && callback('name', 'thinkjs')
            }else if(type === 'error'){
              callback && callback()
            }
          },
          parse: function(){

          }
        }
      })
      think.middleware('parse_form_payload', http).then(function(data){
        assert.deepEqual(http._file, { image: [{ name: 'image' }, {name: 'image1'}, {name: 'image2'}] })
        assert.deepEqual(http._post, {name: 'thinkjs'})
        muk.restore();
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('parse_form_payload content-type match, change file upload path', function(done){
    getHttp('', {
      payload: '',
      headers: {
        'content-type': 'multipart/form-data;boundary=123456789'
      },
      end: function(){

      }
    }).then(function(http){
      var multiparty = require('multiparty');
      var postConfig = think.config('post');
      muk(postConfig, 'file_upload_path', '');
      muk(multiparty, 'Form', function(options){
        assert.equal(options.maxFieldsSize, 2097152);
        assert.equal(options.maxFields, 100);
        assert.equal(options.maxFilesSize, 1073741824);
        assert.equal(options.uploadDir.indexOf(think.sep + 'thinkjs' + think.sep + 'upload') > -1, true);
        return {
          on: function(type, callback){
            if(type === 'close'){
              setTimeout(function(){
                callback && callback();
              }, 20)
            }else if(type === 'file'){
              callback && callback('image', {name: 'image'});
              callback && callback('image', {name: 'image1'});
              callback && callback('image', {name: 'image2'})
            }else if(type === 'field'){
              callback && callback('name', 'thinkjs')
            }else if(type === 'error'){
              callback && callback()
            }
          },
          parse: function(){

          }
        }
      })
      think.middleware('parse_form_payload', http).then(function(data){
        assert.deepEqual(http._file, { image: [{ name: 'image' }, {name: 'image1'}, {name: 'image2'}] })
        assert.deepEqual(http._post, {name: 'thinkjs'})
        muk.restore();
        done();
      }).catch(function(err){
        console.log(err.stack)
      })
    }).catch(function(err){
      console.log(err.stack)
    })
  })
})