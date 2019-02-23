
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

var Base = think.safeRequire(path.resolve(__dirname, '../../lib/middleware/base.js'));

describe('middleware/base', function(){
  before(function(){
    // console.log('before')

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
  })
})