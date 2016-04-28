var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

var Limit = think.safeRequire(path.resolve(__dirname, '../../lib/util/parallel_limit.js'));

describe('await', function(){
  it('init', function(){
    var fn = function(){}
    var instance = new Limit(fn);
    assert.equal(instance.limit, 10);
    assert.equal(instance.callback, fn)
  })
})