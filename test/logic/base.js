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


think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';


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
var Logic = think.lookClass('', 'logic');
function getInstance(config, options){
  return getHttp(config, options).then(function(http){
    return new Logic(http);
  })
}

describe('logic/base', function(){
  it('validate is function', function(done){
    getInstance().then(function(instance){
      assert.equal(think.isFunction(instance.validate), true);
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
      assert.deepEqual(data, { welefen: { string: true, value: '',_method: 'get' } })
      done();
    })
  })
  it('parse rules, required', function(done){
    getInstance().then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required'
      });
      assert.deepEqual(data, { welefen: { string: true, value: '', required: true,_method: 'get' } })
      done();
    })
  })
  it('parse rules, int', function(done){
    getInstance().then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|int'
      });
      assert.deepEqual(data, { welefen: { required: true, int: true, value: '',_method: 'get' } })
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
      assert.deepEqual(data, { welefen: { required: true, int: true, value: '10',_method: 'get' } })
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
      assert.deepEqual(data, { welefen: { required: true, min: [ '5' ], int: true, value: '10' ,_method: 'get'} })
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
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [[ 1, 2, 4 ]], value: '10',_method: 'get' } })
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
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [{ name: 'welefen' }], value: '10',_method: 'get' } })
      done();
    })
  })
  it('parse rules, object args, object', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      }
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: {required: true, int: true, min: {name: 'welefen'}}
      });
      assert.deepEqual(data, { welefen: { required: true, int: true, min: { name: 'welefen' }, value: '10',_method: 'get' } })
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
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [{ name: 'welefen' }], value: '10',_method: 'get' } })
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
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [{ name: 'welefen' }], value: '10',_method: 'get' } })
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
      assert.deepEqual(data, { welefen: { required: true, int: true, min: [{ name: 'welefen' }], value: '20',_method: 'post' } })
      done();
    })
  })
  it('parse rules, value from file, method is post', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      },
      _file: {
        welefen: {path: 'filepath'}
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|file|object'
      });
      assert.deepEqual(data, { welefen: { required: true, object: true, value: {path: 'filepath'},_method: 'file' } })
      done();
    })
  })
  it('parse rules, value from file, method is post 1', function(done){
    getInstance({}, {
      _get: {
        welefen: '10'
      },
      _file: {
        welefen: {path: 'filepath'}
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance._parseValidateData({
        welefen: 'required|file'
      });
      assert.deepEqual(data, { welefen: { required: true, object: true, value: {path: 'filepath'},_method: 'file' } })
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
      //console.log(JSON.stringify(data));
      assert.deepEqual(data, {"suredy":{"required":true,"int":true,"min":[{"name":"welefen"}],"default":"30","value":"",_method: 'post'}})
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
      assert.deepEqual(data, {"suredy":{"required":true,"array":true,"default":[30],"value":"",_method: 'post'}})
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
      assert.deepEqual(data, {"welefen":{"required":true,"float":true,"default":"30","value":"10.3",_method: 'post'}});
      var welefen = instance.post('welefen');
      assert.equal(welefen, '10.3')
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
      //console.log(JSON.stringify(data));
      assert.deepEqual(data, {"welefen":{"required":true,"array":true,"value":"10,3,2",_method: 'post'}});
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
      //console.log(JSON.stringify(data));
      assert.deepEqual(data, {"welefen":{"required":true,"array":true,"int":true,"value":"10,3,2",_method: 'post'}});
      assert.deepEqual(instance.post('welefen'), '10,3,2')
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
      //console.log(JSON.stringify(data));
      assert.deepEqual(data, {"welefen":{"required":true,"array":true,"float":true,"value":"10,3,2.2",_method: 'post'}});
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
      //console.log(JSON.stringify(data));
      assert.deepEqual(data, {"welefen":{"required":true,"array":true,"float":true,"value":["10]","3","2.2"],_method: 'post'}});
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
      //console.log(JSON.stringify(data));
      assert.deepEqual(data, {"welefen":{"required":true,"array":true,"value":{},_method: 'post'}});
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
      //console.log(JSON.stringify(data));
      assert.deepEqual(data, {"welefen":{"required":true,"boolean":true,"value":"yes",_method: 'post'}});
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
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: 'on' ,_method: 'post'} });
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
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: '1',_method: 'post' } });
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
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: 'true',_method: 'post' } });
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
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: 'false',_method: 'post' } });
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
      assert.deepEqual(data, { welefen: { required: true, boolean: true, value: true,_method: 'post' } });
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
      assert.deepEqual(data, { welefen: { required: true, object: true, value: '{}',_method: 'post' } });
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
      assert.deepEqual(data, { welefen: { required: true, object: true, value: '{ww}',_method: 'post' } });
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
      assert.deepEqual(data, { welefen: { required: true, object: true, value: {},_method: 'post'} });
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
  it('parse rules, different, with clean rules 1', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: 30,
        suredy: 30
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        suredy: 'required|int|different:welefen'
      });
      assert.deepEqual(data, false);
      var errors = instance.errors();
      assert.deepEqual(errors.suredy.length > 0, true);
      done();
    })
  })
  it('parse rules, different, with clean rules 2', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '',
        suredy: ''
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        suredy: 'requiredWithout:welefen'
      });
      assert.deepEqual(data, false);
      var errors = instance.errors();
      assert.deepEqual(errors.suredy.length > 0, true);
      done();
    })
  })
  it('parse rules, different, with clean rules 3', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: 'wwww',
        suredy: ''
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        suredy: 'requiredWithout:welefen'
      });
      assert.deepEqual(data, true);
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
  it('parse rules, string, default', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '2014-11-11',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        doc: "string|default:index",
        version: "string|default:2.0"
      });
      assert.deepEqual(data, true);
      done();
    })
  })
  it('parse rules, string, required|int', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: 'test',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'required|int'
      });
      assert.deepEqual(data, false);
      done();
    })
  })
  it('parse rules, string, required|int empty', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'required|int'
      });
      assert.deepEqual(data, false);
      done();
    })
  })
  it('parse rules, string, required|int number string', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '10',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'required|int'
      });
      assert.deepEqual(data, true);
      done();
    })
  })
  it('parse rules, requiredWithout, empty', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '',
        suredy: ''
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: "requiredWithout:suredy|email",
        suredy: "requiredWithout:welefen|mobile"
      });
      assert.deepEqual(data, false);
      done();
    })
  })
  it('parse rules, default, int', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '',
        suredy: ''
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'required|int|default:10'
      });
      assert.deepEqual(data, true);
      var post = instance.post();
      assert.deepEqual(post, {welefen: 10, suredy: ''})
      done();
    })
  })
  it('parse rules, default, int 2', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'int'
      });
      assert.deepEqual(data, true);
      var post = instance.post();
      assert.deepEqual(post, {})
      done();
    })
  })

  it('parse rules, default, float', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '',
        suredy: ''
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'required|float|default:10.2'
      });
      assert.deepEqual(data, true);
      var post = instance.post();
      assert.deepEqual(post, {welefen: 10.2, suredy: ''})
      done();
    })
  })
  it('parse rules, default, array, float', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '',
        suredy: ''
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: 'required|array|float|default:[10.2, 11]'
      });
      var post = instance.post();
      assert.deepEqual(data, true);
      assert.deepEqual(post, {welefen: [10.2, 11], suredy: ''})
      done();
    })
  })
  it('parse rules, requiredWithout, has one', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: 'welefen@gmail.com',
        suredy: ''
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: "requiredWithout:suredy|email",
        suredy:  "requiredWithout:welefen|mobile"
      });
      assert.deepEqual(data, true);
      done();
    })
  })
  it('parse rules, requiredWithout, has two', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: 'welefen@gmail.com',
        suredy: '15811300250'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: "requiredWithout:suredy|email",
        suredy: "requiredWithout:welefen|mobile"
      });
      assert.deepEqual(data, true);
      done();
    })
  })
  it('parse rules, requiredWithout, has two, not mobile', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: 'welefen@gmail.com',
        suredy: '1581130025ww0'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        welefen: "requiredWithout:suredy|email",
        suredy: "requiredWithout:welefen|mobile"
      });
      assert.deepEqual(data, false);
      done();
    })
  })
  it('parse rules, empty, different', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        username: 'string|length:5,16',
        password: 'string|length:5,16|different:username'
      });
      assert.deepEqual(data, true);
      done();
    })
  })
  it('parse rules, string, default, object', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '2014-11-11',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.validate({
        doc: {string: true, default:"index"},
        version: {string: true, default: "2.0"}
      });
      assert.deepEqual(data, true);
      done();
    })
  })
  it('__after, rules empty', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '2014-11-11',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      var data = instance.__after();
      assert.deepEqual(data, undefined);
      done();
    })
  })
  it('__after, _validateInvoked', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        welefen: '2014-11-11',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      instance.rules = {name: 'required'};
      instance._validateInvoked = true;
      var data = instance.__after();
      assert.deepEqual(data, undefined);
      done();
    })
  })
  it('__after, has rules', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        name: '2014-11-11',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      instance.rules = {name: 'required'};
      var data = instance.__after();
      assert.deepEqual(data, undefined);
      assert.equal(instance._validateInvoked, true)
      done();
    })
  })
  it('__after, has rules, has value', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        name: '2014-11-11',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      instance.rules = {name: {
        required: true,
        value: ''
      }};
      var data = instance.__after();
      assert.equal(instance._validateInvoked, true);
      data.catch(function () {
        done();
      })
    })
  })
  it('__after, has rules, has value 1', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        name: '2014-11-11',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      instance.rules = {name: {
        required: true,
        value: 'welefen'
      }};
      var data = instance.__after();
      assert.deepEqual(data, undefined);
      assert.equal(instance._validateInvoked, true);
      done();
    })
  })
  it('__after, has errors', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        name: '',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      instance.rules = {name: 'required'};
      instance.fail = function(errno, errmsg){
        assert.equal(errno, 1001);
      }
      instance.__after()
      done();
    })
  })
  it('__after, has errors, message', function(done){
    getInstance({}, {
      _config: think.config(),
      _post: {
        name: '',
        suredy: '2014-11-10'
      },
      method: 'POST'
    }).then(function(instance){
      instance.rules = {name: 'required', value: 'required'};
      instance.http.end = function(data){
        assert.equal(data.errno, 1001);
        assert.deepEqual(Object.keys(data.errmsg), ['name', 'value'])
      }
      instance.__after().catch(function(){})
      done();
    })
  })
})