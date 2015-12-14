var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var Base = require('../../lib/adapter/base.js');
describe('adapter/base.js', function(){
  it('merge config, empty', function(){
    var instance = new Base();
    var data = instance.parseConfig();
    assert.deepEqual(data, {})
  })
  it('merge config', function(){
    var instance = new Base();
    var data = instance.parseConfig({
      type: 'test',
      name: '111',
      adapter: {
        test: {
          name: '222'
        }
      }
    });
    assert.equal(data.name, '222');
    assert.equal(data.adapter, undefined)
  })
  it('parse config, empty', function(){
    var instance = new Base();
    var data = instance.parseConfig();
    assert.deepEqual(data, {})
  })
  it('parse config, no parser', function(){
    var instance = new Base();
    var data = instance.parseConfig({name: 1});
    assert.deepEqual(data, {name: 1})
  })
  it('parse config, has parser', function(){
    var instance = new Base();
    var data = instance.parseConfig({name: 1, parser: function(options){
      return {name: 2}
    }});
    assert.deepEqual(data, {name: 2})
  })
  it('parse config, has parser, type', function(){
    var instance = new Base();
    var data = instance.parseConfig({name: 1, from: 'cache', parser: function(options){
      assert.equal(options.from, 'cache')
      return {name: 2}
    }});
    assert.deepEqual(data, {name: 2, from: 'cache'});
  })
  it('parse config, has parser, extra, type', function(){
    var instance = new Base();
    var data = instance.parseConfig({name: 1, parser: function(options, type){
      assert.equal(options.name, 3)
      return {name: 2}
    }}, {name: 3});
    assert.deepEqual(data, {name: 2})
  })
})