var assert = require('assert');
var path = require('path');
var fs = require('fs');
var http = require('http');

var thinkjs = require('thinkjs');
var instance = new thinkjs();
instance.load();

var handlebars = require('handlebars');
var Class = require('../lib/index.js');

describe('think-template-handlebars', function(){
  it('run', function(done){
    var instance = new Class();
    var filePath = __dirname + '/a.html';
    fs.writeFileSync(filePath, '{{name}}haha');
    instance.run(filePath, {name: 'thinkjs'}).then(function(content){
      assert.equal(content, 'thinkjshaha');
      fs.unlinkSync(filePath);
      done();
    })
  })
  it('run, pre compiled', function(done){
    var instance = new Class();
    var filePath = __dirname + '/a.html';
    var compiledContent = handlebars.precompile('{{foo}}sss');
    fs.writeFileSync(filePath, compiledContent);
    instance.run(filePath, {foo: 'thinkjs'}).then(function(content){
      assert.equal(content, 'thinkjssss');
      fs.unlinkSync(filePath);
      done();
    }).catch(function(err){
      console.log(err.stack)
    })
  })
})