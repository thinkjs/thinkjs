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
  it('_parseValidateData, empty', function(done){
    getInstance().then(function(instance){
      var data = [];
      data = instance._parseValidateData();
      assert.deepEqual(data, [])
      done();
    })
  })
  it('_parseValidateData, empty 1', function(done){
    getInstance().then(function(instance){
      var data = [];
      data = instance._parseValidateData([]);
      assert.deepEqual(data, [])
      done();
    })
  })
  it('_parseValidateData', function(done){
    getInstance({
      validate: {}
    }, {

    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        default: 1000
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name', required: true, validate: 'int', default: 1000, get: 'get', value: 1000, required_msg: undefined } ])
      done();
    })
  })
  it('_parseValidateData, multi name', function(done){
    getInstance({
      validate: {}
    }, {

    }).then(function(instance){
      var data = [{
        name: 'name,email',
        required: true,
        validate: 'int',
        default: 1000
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',   required: true,   validate: 'int',   default: 1000,   get: 'get',   value: 1000,   required_msg: undefined }, { name: 'email',   required: true,   validate: 'int',   default: 1000,   get: 'get',   value: 1000,   required_msg: undefined } ])
      done();
    })
  })
  it('_parseValidateData, method not matched', function(done){
    getInstance({
      validate: {}
    }, {
      method: 'POST'
    }).then(function(instance){
      var data = [{
        name: 'name,email',
        required: true,
        validate: 'int',
        default: 1000,
        method: 'get'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [])
      done();
    })
  })
  it('_parseValidateData, method not matched', function(done){
    getInstance({
      validate: {}
    }, {
      method: 'POST'
    }).then(function(instance){
      var data = [{
        name: 'name,email',
        required: true,
        validate: 'int',
        default: 1000,
        method: 'get'
      }, {
        name: 'pwd',
        required: true,
        validate: 'length',
        args: [6, 20],
        method: 'post'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'pwd', required: true, validate: 'length', args: [ 6, 20 ], method: [ 'post' ], get: 'post', value: '', required_msg: undefined } ])
      done();
    })
  })
  it('_parseValidateData, action', function(done){
    getInstance({
      validate: {}
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        default: 1000,
        action: 'test'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  default: 1000,  action: [ 'test' ],  get: 'post',  value: 1000,  required_msg: undefined } ])
      done();
    })
  })
  it('_parseValidateData, action not matched', function(done){
    getInstance({
      validate: {}
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        default: 1000,
        action: 'test11'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ ])
      done();
    })
  })
  it('_parseValidateData, controller not matched', function(done){
    getInstance({
      validate: {}
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        default: 1000,
        action: 'group1/test'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ ])
      done();
    })
  })
  it('_parseValidateData, controller matched', function(done){
    getInstance({
      validate: {}
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        default: 1000,
        action: 'group/test'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  default: 1000,  action: [ 'group/test' ],  get: 'post',  value: 1000,  required_msg: undefined } ])
      done();
    })
  })
  it('_parseValidateData, get data method', function(done){
    getInstance({
      validate: {}
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        default: 1000,
        action: 'group/test',
        get: 'post'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  default: 1000,  action: [ 'group/test' ],  get: 'post',  value: 1000,  required_msg: undefined } ])
      done();
    })
  })
  it('_parseValidateData, default is function', function(done){
    getInstance({
      validate: {}
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        default: function(){return 1000},
        action: 'group/test',
        get: 'post'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  default: 1000,  action: [ 'group/test' ],  get: 'post',  value: 1000,  required_msg: undefined } ])
      done();
    })
  })
  it('_parseValidateData, required_msg', function(done){
    getInstance({
      validate: {}
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        default: function(){return 1000},
        action: 'group/test',
        get: 'post',
        required_msg: 'required_msg'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  default: 1000,  action: [ 'group/test' ],  get: 'post',  value: 1000,  required_msg: 'required_msg' } ])
      done();
    })
  })
  it('_parseValidateData, default required_msg', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        default: function(){return 1000},
        action: 'group/test',
        get: 'post'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  default: 1000,  action: [ 'group/test' ],  get: 'post',  value: 1000,  required_msg: 'default required msg' } ])
      done();
    })
  })
  it('_parseValidateData, type number', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        type: 'number',
        action: 'group/test',
        get: 'post'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  type: 'number',  action: [ 'group/test' ],  get: 'post',  value: 0,  required_msg: 'default required msg' } ])
      done();
    })
  })
  it('_parseValidateData, type number', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home',
      _post: {
        name: 10000
      }
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        type: 'number',
        action: 'group/test',
        get: 'post'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  type: 'number',  action: [ 'group/test' ],  get: 'post',  value: 10000,  required_msg: 'default required msg' } ])
      done();
    })
  })
  it('_parseValidateData, type array', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home',
      _post: {
        name: 10000
      }
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        type: 'array',
        action: 'group/test',
        get: 'post'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  type: 'array',  action: [ 'group/test' ],  get: 'post',  value: [ 10000 ],  required_msg: 'default required msg' } ])
      done();
    })
  })
  it('_parseValidateData, type boolean', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home',
      _post: {
        name: 10000
      }
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        type: 'boolean',
        action: 'group/test',
        get: 'post'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  type: 'boolean',  action: [ 'group/test' ],  get: 'post',  value: true,  required_msg: 'default required msg' } ])
      done();
    })
  })
  it('_parseValidateData, type boolean 1', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home',
      _post: {
        name: 'false'
      }
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        type: 'boolean',
        action: 'group/test',
        get: 'post'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  type: 'boolean',  action: [ 'group/test' ],  get: 'post',  value: false,  required_msg: 'default required msg' } ])
      done();
    })
  })
  it('_parseValidateData, type boolean 2', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home',
      _post: {
        name: '0'
      }
    }).then(function(instance){
      var data = [{
        name: 'name',
        required: true,
        validate: 'int',
        type: 'boolean',
        action: 'group/test',
        get: 'post'
      }];
      data = instance._parseValidateData(data);
      assert.deepEqual(data, [ { name: 'name',  required: true,  validate: 'int',  type: 'boolean',  action: [ 'group/test' ],  get: 'post',  value: false,  required_msg: 'default required msg' } ])
      done();
    })
  })
  it('_validate, data empty', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [];
      data = instance._validate(data);
      assert.deepEqual(data, undefined)
      done();
    })
  })
  it('_validate, success', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      _post: {
        name: 'welefen'
      },
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        validate: 'length',
        args: [4, 10],
        required: true
      }];
      data = instance._validate(data);
      assert.deepEqual(data, undefined)
      done();
    })
  })
  it('_validate, has default value', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      _post: {
        name: ''
      },
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      var data = [{
        name: 'name',
        validate: 'length',
        args: [4, 10],
        default: 'suredy'
      }];
      data = instance._validate(data);
      assert.deepEqual(instance.post('name'), 'suredy')
      done();
    })
  })
  it('_validate, this.validate', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg'
      }
    }, {
      _post: {
        name: ''
      },
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      instance.validate = [{
        name: 'name',
        validate: 'length',
        args: [4, 10],
        default: 'suredy'
      }];
      var data = instance._validate();
      assert.deepEqual(instance.post('name'), 'suredy')
      done();
    })
  })
  it('_validate, fail', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg',
        code: 400,
        msg: 'not valid'
      }
    }, {
      _post: {
        name: 'fasdfasdfasdfasdf'
      },
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      instance.validate = [{
        name: 'name',
        validate: 'length',
        args: [4, 10]
      }];
      instance.fail = function(code, msg, ret){
        assert.equal(code, 400);
        assert.equal(msg, 'not valid');
        assert.deepEqual(Object.keys(ret), ['name'])
      }
      var data = instance._validate();
      done();
    })
  })
  it('_validate, fail, with msg', function(done){
    getInstance({
      validate: {
        required_msg: 'default required msg',
        code: 400,
        msg: 'not valid'
      }
    }, {
      _post: {
        name: 'fasdfasdfasdfasdf'
      },
      method: 'POST',
      action: 'test',
      controller: 'group',
      module: 'home'
    }).then(function(instance){
      instance.validate = [{
        name: 'name',
        validate: 'length',
        args: [4, 10],
        msg: 'length is 4 to 10'
      }];
      instance.fail = function(code, msg, ret){
        assert.equal(code, 400);
        assert.equal(msg, 'not valid');
        assert.deepEqual(ret.name, 'length is 4 to 10')
      }
      var data = instance._validate();
      done();
    })
  })
})