var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();
    
var Base = require('../../lib/middleware/base.js');

describe('middleware/base', function(){
  before(function(){
    console.log('before')

  })
  it('base is function', function(){
    assert.equal(think.isFunction(Base), true);
  })
  it('base.run is function', function(){
    var instance = new Base({})
    assert.equal(think.isFunction(instance.run), true);
    assert.equal(instance.run(), undefined);
  })
  it('base is inherit from think.base', function(){
    var instance = new Base({});
    var instance1 = new think.base({});
    assert.equal(instance.invoke, instance1.invoke);
    assert.equal(instance.action, instance1.action);
    assert.equal(instance.model, instance1.model);
    assert.equal(instance.service, instance1.service);
  })
})