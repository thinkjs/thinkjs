'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var Template = think.adapter('template', 'ejs');

describe('adapter/template/ejs.js', function(){
  it('get instance', function(){
    var instance = new Template();
    assert.equal(think.isFunction(instance.run), true);
  })
  it('run', function(done){
    var instance = new Template();
    muk(think, 'npm', function(){
      return {
        compile: function(content, conf){
          assert.equal(content.indexOf("describe('adapter/template/ejs.js'") > -1, true);
          assert.equal(conf.filename, __filename);
          assert.equal(conf.cache, true);
          //assert.deepEqual(conf, { filename: __filename, cache: true })
          return function(data){
            return content;
          }
        }
      }
    })
    instance.run(__filename).then(function(data){
      assert.equal(data.indexOf("describe('adapter/template/ejs.js'") > -1, true);
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('run, config', function(done){
    var instance = new Template();
    muk(think, 'npm', function(){
      return {
        compile: function(content, conf){
          assert.equal(content.indexOf("describe('adapter/template/ejs.js'") > -1, true);
          assert.equal(conf.filename, __filename);
          assert.equal(conf.cache, true);
          assert.equal(conf.test, 'haha')
          //assert.deepEqual(conf, { filename: __filename, cache: true , test: 'haha'})
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
      adapter: {
        ejs: {
          test: 'haha'
        }
      }
    }).then(function(data){
      assert.equal(data.indexOf("describe('adapter/template/base.js'") > -1, true);
      muk.restore();
      done();
    })
  })
  it('run, config, with prerender', function(done){
    var instance = new Template();
    muk(think, 'npm', function(){
      return {
        compile: function(content, conf){
          assert.equal(content.indexOf("describe('adapter/template/ejs.js'") > -1, true);
          assert.equal(conf.filename, __filename);
          assert.equal(conf.cache, true);
          assert.equal(conf.test, 'haha')
          //assert.deepEqual(conf, { filename: __filename, cache: true , test: 'haha'})
          return function(data){
            assert.deepEqual(data, {name: 'welefen'})
            return content;
          }
        }
      }
    })
    muk(think, 'log', function(){})
    var flag = false;
    instance.run(__filename, {
      name: 'welefen'
    }, {
      prerender: function(ejs){
        assert.equal(think.isObject(ejs), true);
        flag = true;
      },
      type: 'ejs', 
      options: {
        test: 'haha'
      }
    }).then(function(data){
      assert.equal(data.indexOf("describe('adapter/template/base.js'") > -1, true);
      muk.restore();
      assert.equal(flag, true)
      done();
    })
  })
})