var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

var gc = require('../../lib/config/gc.js');

describe('config/gc', function(){
  it('gc filter', function(){
    var filter = gc.filter;
    assert.equal(think.isFunction(filter), true);
  })
  it('gc filter exec', function(){
    var filter = gc.filter;
    muk(Date.prototype, 'getHours', function(){return 4})
    var data = filter();
    assert.equal(data, true)
    muk.restore();
  })
  it('gc filter exec 1', function(){
    var filter = gc.filter;
    muk(Date.prototype, 'getHours', function(){return 3})
    var data = filter();
    assert.equal(data, undefined)
    muk.restore();
  })
})