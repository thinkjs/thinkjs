'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


for(var filepath in require.cache){
  delete require.cache[filepath];
}
var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();


think.APP_PATH = path.dirname(__dirname) + '/testApp';


var _http = require('../_http.js');

function getHttp(config, options){
  think.APP_PATH = path.dirname(__dirname) + '/testApp';
  var req = think.extend({}, _http.req);
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
var Logic = think.lookClass('', 'logic');
function getInstance(config, options){
  return getHttp(config, options).then(function(http){
    return new Logic(http);
  })
}

describe('logic/base', function(){
  it('__before is function', function(done){
    getInstance().then(function(instance){
      assert.equal(think.isFunction(instance.__before), true);
      done();
    })
  })
  it('validate, empty', function(done){
    getInstance().then(function(instance){
      var data = instance.validate();
      assert.deepEqual(data, true)
      done();
    })
  })
  it('validate, empty 1', function(done){
    getInstance().then(function(instance){
      var data = instance.validate({});
      assert.deepEqual(data, true)
      done();
    })
  })
  it('parse rules, empty', function(done){
    getInstance().then(function(instance){
      var data = instance._parseValidateData();
      assert.deepEqual(data, { })
      done();
    })
  })
  it('parse rules, empty 1', function(done){
    getInstance().then(function(instance){
      var data = instance._parseValidateData({
        welefen: ''
      });
      assert.deepEqual(data, { welefen: { string: true, value: '' } })
      done();
    })
  })
  it('parse rules, required', function(done){
    getInstance().then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required'
      });
      assert.deepEqual(data, { welefen: { string: true, value: '', required: true } })
      done();
    })
  })
  it('parse rules, int', function(done){
    getInstance().then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|int'
      });
      assert.deepEqual(JSON.stringify(data), '{"welefen":{"required":true,"int":true,"value":null}}')
      done();
    })
  })
  it('parse rules, int, has value', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      }
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|int'
      });
      assert.deepEqual(data, { welefen: { required: true, int: true, value: 10 } })
      done();
    })
  })
  it('parse rules, min, has value', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      }
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|int|min:5'
      });
      assert.deepEqual(data, { welefen: { required: true, min: [ '5' ], int: true, value: 10 } })
      done();
    })
  })
  it('parse rules, array args', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      }
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|int|min:[1,2,4]'
      });
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [[ 1, 2, 4 ]], value: 10 } })
      done();
    })
  })
  it('parse rules, object args', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      }
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|int|min: {name: "welefen"}'
      });
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [{ name: 'welefen' }], value: 10 } })
      done();
    })
  })
  it('parse rules, value from get', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      }
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|get|int|min: {name: "welefen"}'
      });
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [{ name: 'welefen' }], value: 10 } })
      done();
    })
  })
  it('parse rules, value from get, method is post', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      },
      _post: {
        welefen: '20'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|get|int|min: {name: "welefen"}'
      });
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [{ name: 'welefen' }], value: 10 } })
      done();
    })
  })
  it('parse rules, value from post, method is post', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      },
      _post: {
        welefen: '20'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|int|min: {name: "welefen"}'
      });
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [{ name: 'welefen' }], value: 20 } })
      done();
    })
  })
  it('parse rules, value from file, method is post', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      },
      _file: {
        welefen: '20'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|file|int|min: {name: "welefen"}'
      });
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [{ name: 'welefen' }], value: 20 } })
      done();
    })
  })
  it('parse rules, default value', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      },
      _file: {
        welefen: '20'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        suredy: 'required|int|min: {name: "welefen"}|default:30'
      });
      assert.deepEqual(data, { suredy: { required: true, int: true, min: [ {"name":"welefen"} ], value: 30 } })
      done();
    })
  })
  it('parse rules, default value is array', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      },
      _file: {
        welefen: '20'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        suredy: 'required|array|default:[30]'
      });
      assert.deepEqual(data, {"suredy":{"required":true,"array":true,"value":[[30]]}})
      done();
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('parse rules, float', function(done){
    getInstance({}, {
      _post: {
        welefen: '10.3'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|float|default:30'
      });
      assert.deepEqual(data, { welefen: { required: true, float: true, value: 10.3 } });
      var welefen = instance.post('welefen');
      assert.equal(welefen, 10.3)
      done();
    })
  })
  it('parse rules, array', function(done){
    getInstance({}, {
      _post: {
        welefen: '10,3,2'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|array'
      });
      assert.deepEqual(data, { welefen: { required: true, array: true, value: [ '10', '3', '2' ] } });
      done();
    })
  })
  it('parse rules, array int', function(done){
    getInstance({}, {
      _post: {
        welefen: '10,3,2'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|array|int'
      });
      assert.deepEqual(data, { welefen: { required: true, array: true, int: true, value: [ 10, 3, 2 ] } });
      assert.deepEqual(instance.post('welefen'), [ 10, 3, 2 ])
      done();
    })
  })
  it('parse rules, array float', function(done){
    getInstance({}, {
      _post: {
        welefen: '10,3,2.2'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|array|float'
      });
      assert.deepEqual(data, { welefen: { required: true, array: true, float: true, value: [ 10, 3, 2.2 ] } });
      done();
    })
  })
  it('parse rules, array float, item is string', function(done){
    getInstance({}, {
      _post: {
        welefen: ['10]','3','2.2']
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|array|float'
      });
      assert.deepEqual(data, { welefen: { required: true, array: true, float: true, value: [ 10, 3, 2.2 ] } });
      done();
    })
  })
  it('parse rules, array float, item is object', function(done){
    getInstance({}, {
      _post: {
        welefen: {}
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|array'
      });
      assert.deepEqual(data, { welefen: { required: true, array: true,  value: [ {}] } });
      done();
    })
  })
  it('parse rules, boolean, yes', function(done){
    getInstance({}, {
      _post: {
        welefen: 'yes'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|boolean'
      });
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: true } });
      done();
    })
  })
  it('parse rules, boolean, on', function(done){
    getInstance({}, {
      _post: {
        welefen: 'on'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|boolean'
      });
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: true } });
      done();
    })
  })
  it('parse rules, boolean, 1', function(done){
    getInstance({}, {
      _post: {
        welefen: '1'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|boolean'
      });
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: true } });
      done();
    })
  })
  it('parse rules, boolean, true', function(done){
    getInstance({}, {
      _post: {
        welefen: 'true'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|boolean'
      });
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: true } });
      done();
    })
  })
    it('parse rules, boolean, true', function(done){
    getInstance({}, {
      _post: {
        welefen: 'false'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|boolean'
      });
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: false } });
      done();
    })
  })
  it('parse rules, boolean, true, boolean', function(done){
    getInstance({}, {
      _post: {
        welefen: true
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|boolean'
      });
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: true } });
      done();
    })
  })
  it('parse rules, object', function(done){
    getInstance({}, {
      _post: {
        welefen: "{}"
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|object'
      });
      assert.deepEqual(data, { welefen: { required: true, object: true, value: {} } });
      done();
    })
  })
  it('parse rules, object error', function(done){
    getInstance({}, {
      _post: {
        welefen: "{ww}"
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|object'
      });
      assert.deepEqual(data, { welefen: { required: true, object: true, value: '' } });
      done();
    })
  })
  it('parse rules, object', function(done){
    getInstance({}, {
      _post: {
        welefen: {}
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|object'
      });
      assert.deepEqual(data, { welefen: { required: true, object: true, value: {}} });
      done();
    })
  })
  it('parse rules, object', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: {
          name: 'welefen'
        }
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'required|object'
      });
      assert.deepEqual(data, true);
      done();
    })
  })
  it('parse rules, object, fail', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: 30
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'required|int|max:10'
      });
      assert.deepEqual(data, false);
      var errors = instance.errors();
      assert.deepEqual(errors.welefen.length > 0, true);
      done();
    })
  })
  it('parse rules, different', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: 30,
        suredy: 30
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'required|int|max:40',
        suredy: 'required|different:welefen'
      });
      assert.deepEqual(data, false);
      var errors = instance.errors();
      assert.deepEqual(errors.suredy.length > 0, true);
      done();
    })
  })
  it('parse rules, after', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '2014-11-11',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'required|before',
        suredy: 'required|after:welefen'
      });
      assert.deepEqual(data, false);
      var errors = instance.errors();
      assert.deepEqual(errors.suredy.length > 0, true);
      done();
    })
  })
 })