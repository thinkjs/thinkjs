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