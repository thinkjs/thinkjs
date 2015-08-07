'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var baseTemplate = think.adapter('template', 'base');

describe('adapter/template/base.js', function(){
  it('get instance', function(){
    var instance = new baseTemplate();
    assert.equal(think.isFunction(instance.run), true);
  })
  it('get content success', function(done){
    var instance = new baseTemplate();
    instance.getContent(__filename).then(function(data){
      assert.equal(data.indexOf("describe('adapter/template/base.js'") > -1, true);
      done();
    })
  })
  it('run', function(done){
    var instance = new baseTemplate();
    instance.run(__filename).then(function(data){
      assert.equal(data.indexOf("describe('adapter/template/base.js'") > -1, true);
      done();
    })
  })
})