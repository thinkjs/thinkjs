var should = require('should');
var assert = require('assert');
var muk = require('muk');
process.argv[2] = '/'; //命中命令行模式
require('../www/index.js');

var Filter = thinkRequire('Filter').filter;

describe('Filter', function(){
  it('filter page 1', function(){
    var data = Filter(1, 'page');
    assert.equal(data, 1);
  })
  it('filter page 0 ', function(){
    var data = Filter(0, 'page');
    assert.equal(data, 1);
  })
  it('filter page -1 ', function(){
    var data = Filter(-1, 'page');
    assert.equal(data, 1);
  })
  it('filter page A ', function(){
    var data = Filter('A', 'page');
    assert.equal(data, 1);
  })
  it('filter page 10 ', function(){
    var data = Filter(10, 'page');
    assert.equal(data, 10);
  })
  it('filter page "10" ', function(){
    var data = Filter("10", 'page');
    assert.equal(data, 10);
  })


  it('filter order "id ASC" ', function(){
    var data = Filter("id ASC", 'order');
    assert.equal(data, 'id ASC');
  })
  it('filter order "id DESC" ', function(){
    var data = Filter("id DESC", 'order');
    assert.equal(data, 'id DESC');
  })
  it('filter order "id xxx" ', function(){
    var data = Filter("id xxx", 'order');
    assert.equal(data, '');
  })
  it('filter order "id asc" ', function(){
    var data = Filter("id asc", 'order');
    assert.equal(data, 'id asc');
  })
  it('filter order "id asc,name desc" ', function(){
    var data = Filter("id asc,name desc", 'order');
    assert.equal(data, 'id asc,name desc');
  })
  it('filter order "id asc,name xxx" ', function(){
    var data = Filter("id asc,name xxx", 'order');
    assert.equal(data, 'id asc');
  })

  it('filter id 0', function(){
    var data = Filter(0, 'id');
    assert.equal(data, 0);
  })
  it('filter id "0"', function(){
    var data = Filter("0", 'id');
    assert.equal(data, 0);
  })
  it('filter id "1"', function(){
    var data = Filter("1", 'id');
    assert.equal(data, 1);
  })
  it('filter id "-1"', function(){
    var data = Filter("-1", 'id');
    assert.equal(data, 0);
  })
  it('filter id "10A"', function(){
    var data = Filter("10A", 'id');
    assert.equal(data, 10);
  })


  it('filter ids 0', function(){
    var data = Filter(0, 'ids');
    assert.equal(data.length, 0);
  })
  it('filter ids 1', function(){
    var data = Filter(1, 'ids');
    assert.equal(JSON.stringify(data), '[1]');
  })
  it('filter ids "1"', function(){
    var data = Filter('1', 'ids');
    assert.equal(JSON.stringify(data), '[1]');
  })
  it('filter ids "1,2"', function(){
    var data = Filter('1,2', 'ids');
    assert.equal(JSON.stringify(data), '[1,2]');
  })
  it('filter ids {}', function(){
    var data = Filter({}, 'ids');
    assert.equal(JSON.stringify(data), '[]');
  })


})