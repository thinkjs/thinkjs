'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

var Service = think.safeRequire(path.resolve(__dirname, '../../lib/service/base.js'));

describe('service/base.js', function(){
  before(function () {
    think.module = ['common'];
  });
  it('instance', function(){
    var instance = new Service();
    assert.equal(think.isFunction(instance.init), true)
  });
  it('model, check model name', function(){
    var instance = new Service();
    var model = instance.model('user');
    assert.equal(model.name, 'user');
  });
  it('model, check model from module common', function(){
    var instance = new Service();
    var model = instance.model('user', 'common');
    assert.equal(model.name, 'user');
  });
  it('model, check model from module', function(){
    var instance = new Service();
    var model = instance.model('user', '');
    assert.equal(model.name, 'user');
  });
  it('service, check service name', function(){
    var instance = new Service();
    var service = instance.service('base');
    assert.equal(typeof service, 'function');
  });
  it('service, check service from module common', function(){
    var instance = new Service();
    var service = instance.service('base', 'common');
    assert.equal(typeof service, 'function');
  });
  it('service, check service from module', function(){
    var instance = new Service();
    var service = instance.service('base', '');
    assert.equal(typeof service, 'function');
  });
});