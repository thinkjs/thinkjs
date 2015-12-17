var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var BaseWebSocket = think.adapter('websocket', 'base');

describe('adapter/websocket/base.js', function(){
  it('init', function(){
    var server = {};
    var config = {};
    var app = {};
    var instance = new BaseWebSocket(server, config, app);
    assert.equal(instance.server, server);
    assert.equal(instance.config, config);
    assert.equal(instance.app, app);
  })
  it('isOriginAllowed, undefined', function(){
    var server = {};
    var config = {};
    var app = {};
    var instance = new BaseWebSocket(server, config, app);
    var result = instance.isOriginAllowed('www.thinkjs.org');
    assert.equal(result, true);
  })
  it('isOriginAllowed, string', function(){
    var server = {};
    var config = {allow_origin: 'www.thinkjs.org'};
    var app = {};
    var instance = new BaseWebSocket(server, config, app);
    var result = instance.isOriginAllowed('http://www.thinkjs.org');
    assert.equal(result, true);
  })
  it('isOriginAllowed, array', function(){
    var server = {};
    var config = {allow_origin: ['www.thinkjs.org']};
    var app = {};
    var instance = new BaseWebSocket(server, config, app);
    var result = instance.isOriginAllowed('http://www.thinkjs.org');
    assert.equal(result, true);
  })
  it('isOriginAllowed, function', function(){
    var server = {};
    var config = {allow_origin: function(origin){return origin === 'www.thinkjs.org'}};
    var app = {};
    var instance = new BaseWebSocket(server, config, app);
    var result = instance.isOriginAllowed('http://www.thinkjs.org');
    assert.equal(result, true);
  })
  it('isOriginAllowed, other', function(){
    var server = {};
    var config = {allow_origin: {}};
    var app = {};
    var instance = new BaseWebSocket(server, config, app);
    var result = instance.isOriginAllowed('http://www.thinkjs.org');
    assert.equal(result, false);
  })
  it('run is function', function(){
    var server = {};
    var config = {allow_origin: {}};
    var app = {};
    var instance = new BaseWebSocket(server, config, app);
    assert.equal(think.isFunction(instance.run), true);
  })
})