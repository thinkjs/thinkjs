'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';


var Template = think.adapter('template', 'jade');

describe('adapter/template/jade.js', function(){
  it('get instance', function(){
    var instance = new Template();
    assert.equal(think.isFunction(instance.run), true);
  })
  it('run', function(done){
    var instance = new Template();
    muk(think, 'npm', function(){
      return {
        compile: function(content, conf){
          assert.equal(content.indexOf("describe('adapter/template/jade.js'") > -1, true);
          assert.deepEqual(conf, { filename: __filename })
          return function(data){
            return content;
          }
        }
      }
    })
    instance.run(__filename).then(function(data){
      assert.equal(data.indexOf("describe('adapter/template/jade.js'") > -1, true);
      muk.restore();
      done();
    })
  })
  it('run, config', function(done){
    var instance = new Template();
    muk(think, 'npm', function(){
      return {
        compile: function(content, conf){
          assert.equal(content.indexOf("describe('adapter/template/jade.js'") > -1, true);
          assert.deepEqual(conf, { filename: __filename , test: 'haha'})
          return function(data){
            assert.deepEqual(data, {name: 'welefen'})
            return content;
          }
        }
      }
    })
    instance.run(__filename, {
      name: 'welefen'
    }, {
      type: 'ejs', 
      options: {
        test: 'haha'
      }
    }).then(function(data){
      assert.equal(data.indexOf("describe('adapter/template/jade.js'") > -1, true);
      muk.restore();
      done();
    })
  })
})