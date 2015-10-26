'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

var Service = require('../../lib/service/base.js');

describe('service/base.js', function(){
  it('instance', function(){
    var instance = new Service();
    assert.equal(think.isFunction(instance.init), true)
  })
})