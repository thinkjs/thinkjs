var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Base = require('../../lib/core/base.js');
require('../../lib/core/think.js');

var Cls = think.Class(Base, {
  __before: function(){
    this.name = 'name';
  },
  getName: function(){
    return this.name;
  },
  __after: function(){
    this.name = '';
  }
})

var Cls1 = think.Class(Base, {
  getName: function(){
    return this.name;
  },
  __after: function(){
    this.name = 'after';
    return this.name;
  }
})

var Cls2 = think.Class(Base, {
  getName: function(){
    return this.name;
  },
  __before: function(){
    this.name = 'before';
  }
})

var Cls3 = think.Class(Base, {
  getName: function(name){
    this.name = name;
    return this.name;
  },
  __before: function(){
    this.name = 'before';
  }
})


describe('core/base.js', function(){
  it('Base is function', function(){
    assert.equal(typeof Base, 'function')
  })
  it('cls inherit Base, __before, __after', function(done){
    var instance = new Cls();
    var name = instance.invoke('getName');
    name.then(function(data){
      assert.equal(data, 'name');
      var afterName = instance.getName();
      assert.equal(afterName, '');
      done();
    })
  })
  it('cls inherit Base, __after', function(done){
    var instance = new Cls1();
    var name = instance.invoke('getName');
    name.then(function(data){
      assert.equal(data, undefined);
      var afterName = instance.getName();
      assert.equal(afterName, 'after');
      done();
    })
  })
  it('cls inherit Base, __before', function(done){
    var instance = new Cls2();
    var name = instance.invoke('getName');
    name.then(function(data){
      assert.equal(data, 'before');
      var afterName = instance.getName();
      assert.equal(afterName, 'before');
      done();
    })
  })
  it('cls inherit Base, args', function(done){
    var instance = new Cls3();
    var name = instance.invoke('getName', 'getName');
    name.then(function(data){
      assert.equal(data, 'getName');
      var afterName = instance.getName();
      assert.equal(afterName, undefined);
      done();
    })
  })
})