var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path')

global.APP_PATH = path.normalize(__dirname + '/../../App');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../../index.js'));

var Filter = thinkRequire('Filter');

describe('Filter.filter', function(){
  it('filter page 1', function(){
    var data = Filter.filter(1, 'page');
    assert.equal(data, 1);
  })
  it('filter page 0 ', function(){
    var data = Filter.filter(0, 'page');
    assert.equal(data, 1);
  })
  it('filter page -1 ', function(){
    var data = Filter.filter(-1, 'page');
    assert.equal(data, 1);
  })
  it('filter page A ', function(){
    var data = Filter.filter('A', 'page');
    assert.equal(data, 1);
  })
  it('filter page 10 ', function(){
    var data = Filter.filter(10, 'page');
    assert.equal(data, 10);
  })
  it('filter page "10" ', function(){
    var data = Filter.filter("10", 'page');
    assert.equal(data, 10);
  })


  it('filter order "id ASC" ', function(){
    var data = Filter.filter("id ASC", 'order');
    assert.equal(data, 'id ASC');
  })
  it('filter order "id DESC" ', function(){
    var data = Filter.filter("id DESC", 'order');
    assert.equal(data, 'id DESC');
  })
  it('filter order "id xxx" ', function(){
    var data = Filter.filter("id xxx", 'order');
    assert.equal(data, '');
  })
  it('filter order "id asc" ', function(){
    var data = Filter.filter("id asc", 'order');
    assert.equal(data, 'id asc');
  })
  it('filter order "id asc,name desc" ', function(){
    var data = Filter.filter("id asc,name desc", 'order');
    assert.equal(data, 'id asc,name desc');
  })
  it('filter order "id asc,name xxx" ', function(){
    var data = Filter.filter("id asc,name xxx", 'order');
    assert.equal(data, 'id asc');
  })
  it('filter order obj ', function(){
    var data = Filter.filter({}, 'order');
    assert.equal(data, '');
  })

  it('filter id 0', function(){
    var data = Filter.filter(0, 'id');
    assert.equal(data, 0);
  })
  it('filter id "0"', function(){
    var data = Filter.filter("0", 'id');
    assert.equal(data, 0);
  })
  it('filter id "1"', function(){
    var data = Filter.filter("1", 'id');
    assert.equal(data, 1);
  })
  it('filter id "-1"', function(){
    var data = Filter.filter("-1", 'id');
    assert.equal(data, 0);
  })
  it('filter id "10A"', function(){
    var data = Filter.filter("10A", 'id');
    assert.equal(data, 10);
  })


  it('filter ids 0', function(){
    var data = Filter.filter(0, 'ids');
    assert.equal(data.length, 0);
  })
  it('filter ids 1', function(){
    var data = Filter.filter(1, 'ids');
    assert.equal(JSON.stringify(data), '[1]');
  })
  it('filter ids "1"', function(){
    var data = Filter.filter('1', 'ids');
    assert.equal(JSON.stringify(data), '[1]');
  })
  it('filter ids "1,2"', function(){
    var data = Filter.filter('1,2', 'ids');
    assert.equal(JSON.stringify(data), '[1,2]');
  })
  it('filter ids "1,2,0"', function(){
    var data = Filter.filter('1,2,0', 'ids');
    assert.equal(JSON.stringify(data), '[1,2]');
  })
  it('filter ids {}', function(){
    var data = Filter.filter({}, 'ids');
    assert.equal(JSON.stringify(data), '[]');
  })

  it('filter in', function(){
    var data = Filter.filter(1, 'in', 1);
    assert.equal(data, true);
  })
  it('filter in, false', function(){
    var data = Filter.filter(2, 'in', 1);
    assert.equal(data, '');
  })
  it('filter in 1', function(){
    var data = Filter.filter(1, 'in', [1]);
    assert.equal(data, 1);
  })
  it('filter strs empty', function(){
    var data = Filter.filter('', 'strs');
    assert.deepEqual(data, []);
  })
  it('filter strs not array', function(){
    var data = Filter.filter({}, 'strs');
    assert.deepEqual(data, []);
  })
  it('filter strs value', function(){
    var data = Filter.filter('1,2', 'strs');
    assert.deepEqual(data, [1, 2]);
  })
  it('filter strs value 1', function(){
    var data = Filter.filter('1, 2', 'strs');
    assert.deepEqual(data, [1, 2]);
  })
  it('filter strs value 2', function(){
    var data = Filter.filter('1 2', 'strs', ' ');
    assert.deepEqual(data, [1, 2]);
  })

  it('filter xxxx', function(){
    var data = Filter.filter('1 2', 'xxxx');
    assert.deepEqual(data, false);
  })
  it('filter ignore', function(){
    var data = Filter.ignore({a: 0, b: undefined});
    assert.deepEqual(data, {a: 0});
  })
  it('filter ignore', function(){
    var data = Filter.ignore({a: 0, b: undefined}, true);
    assert.deepEqual(data, {});
  })
  it('filter ignore', function(){
    var data = Filter.ignore({a: 0, b: undefined, c: '', d: null}, true);
    assert.deepEqual(data, {});
  })
  it('filter ignore', function(){
    var data = Filter.ignore({a: 0, b: undefined, c: '', d: null}, 3);
    assert.deepEqual(data, {a: 0, b: undefined, c: '', d: null});
  })
  it('filter ignore', function(){
    var data = Filter.ignore({a: 0, b: undefined, c: '', d: null}, [3]);
    assert.deepEqual(data, {a: 0, b: undefined, c: '', d: null});
  })
  it('filter ignore', function(){
    var data = Filter.ignore([3], [3]);
    assert.deepEqual(data, [3]);
  })
})