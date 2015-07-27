var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Base = require('../../lib/core/base.js');


var list = ['init', 'invoke', 'config', 'action', 'cache', 'hook', 'model', 'controller', 'service'];

describe('core/base.js', function(){
  it('Base is function', function(){
    assert.equal(typeof Base, 'function')
  })
  list.forEach(function(item){
    it(item + ' is function', function(){
      var instance = new Base({});
      assert.equal(typeof instance[item], 'function');
    })
  })
})