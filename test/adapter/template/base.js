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
    var data = instance.getContent(__filename);
    assert.equal(data.indexOf("describe('adapter/template/base.js'") > -1, true);
    done();
  })
  it('merge config', function(done){
    var instance = new baseTemplate();
    muk(think, 'log', function(callback){
      var msg = callback && callback({
        yellow: function(msg){
          return msg
        }
      });
      assert.equal(msg.indexOf('[DEPRECATED]') > -1, true);
    })
    var data = instance.parseConfig({
      options: {name: 111}
    });
    assert.deepEqual(data.name, 111);
    muk.restore();
    done();
  })
  it('run', function(done){
    var instance = new baseTemplate();
    var data = instance.run(__filename);
    assert.equal(data.indexOf("describe('adapter/template/base.js'") > -1, true);
    done();
  })
})