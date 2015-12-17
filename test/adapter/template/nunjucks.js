'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var Template = think.adapter('template', 'nunjucks');

describe('adapter/template/nunjucks.js', function(){
  it('get instance', function(){
    var instance = new Template();
    assert.equal(think.isFunction(instance.run), true);
  })
  it('run', function(done){
    var instance = new Template();
    muk(think, 'npm', function(){
      return {
        configure: function(){
          return {
            addGlobal: function(){}
          }
        },
        render: function(filepath, conf){
          var content = fs.readFileSync(filepath, 'utf8')
          assert.equal(content.indexOf("describe('adapter/template/nunjucks.js'") > -1, true);
          assert.deepEqual(conf, undefined)
          return content;
        }
      }
    })
    instance.run(__filename).then(function(data){
      assert.equal(data.indexOf("describe('adapter/template/nunjucks.js'") > -1, true);
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
        configure: function(){
          return {
            addGlobal: function(){}
          }
        },
        render: function(filepath, conf){
          var content = fs.readFileSync(filepath, 'utf8')
          assert.equal(content.indexOf("describe('adapter/template/nunjucks.js'") > -1, true);
          assert.deepEqual(conf,{ name: 'welefen' })
          return content;
        }
      }
    })
    muk(think, 'log', function(){})
    instance.run(__filename, {
      name: 'welefen'
    }, {
      type: 'swig', 
      options: {
        test: 'haha'
      }
    }).then(function(data){
      assert.equal(data.indexOf("describe('adapter/template/base.js'") > -1, true);
      muk.restore();
      done();
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('run, config, with prerender', function(done){
    var instance = new Template();
    muk(think, 'npm', function(){
      return {
        configure: function(){
          return {addFilter: function(){}, addGlobal: function(){}};
        },
        render: function(filepath, conf){
          var content = fs.readFileSync(filepath, 'utf8')
          assert.equal(content.indexOf("describe('adapter/template/nunjucks.js'") > -1, true);
          assert.deepEqual(conf,{ name: 'welefen' })
          return content;
        }
      }
    })
    var flag = false;
    instance.run(__filename, {
      name: 'welefen'
    }, {
      prerender: function(obj, obj2){
        //console.log('prerender')
        assert.equal(think.isObject(obj), true);
        assert.equal(think.isFunction(obj2.addFilter), true);
        flag = true;
      },
      type: 'nunjucks', 
      adapter: {
        nunjucks: {
          test: 'haha'
        }
      }
    }).then(function(data){
      assert.equal(data.indexOf("describe('adapter/template/base.js'") > -1, true);
      muk.restore();
      assert.equal(flag, true);
      done();
    }).catch(function(err){
      console.log(err.stack)
    })
  })
})