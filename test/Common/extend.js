var path = require('path');
var assert = require('assert');

require(path.normalize(__dirname + '/../../lib/Common/extend.js'));

describe('Object.values', function(){
  it('Object.values({}) = []', function(){
    assert.equal(JSON.stringify(Object.values({})), '[]');
  })
  it('Object.values({name: 1}) = [1]', function(){
    assert.equal(JSON.stringify(Object.values({name: 1})), '[1]')
  })
})

describe('Array.prototype.sum', function(){
  it('[1].sum() = 1', function(){
    assert.equal([1].sum(), 1);
  })
  it('[0,1,2].sum() = 3', function(){
    assert.equal([0,1,2].sum(), 3)
  })
  it('[-10,0,100].sum() = 90', function(){
    assert.equal([-10,0,100].sum(), 90)
  })
  it('[-10,0,100, ""].sum() = 90', function(){
    assert.equal([-10,0,100, ''].sum(), 90)
  })
  it('[-10,0,100, "-90"].sum() = 0', function(){
    assert.equal([-10,0,100, '-90'].sum(), 0)
  })
  it('[-10,0,100, "-90A"].sum() = 90', function(){
    assert.equal([-10,0,100, '-90A'].sum(), 0)
  })
  it('[-10,0,100, "-90.33A"].sum() = 90', function(){
    assert.equal([-10,0,100, '-90.33A'].sum().toFixed(2), -0.33)
  })
})