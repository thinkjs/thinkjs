'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var Base = require('../../../lib/adapter/db/base.js');

describe('adapter/db/base.js', function(){
  it('get instance', function(){
    var instance = new Base();
    assert.equal(instance.sql, '');
    assert.equal(instance.lastInsertId, 0);
    assert.equal(instance.socket, null);
  })
})