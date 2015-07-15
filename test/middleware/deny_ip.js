var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

var _http = require('../_http.js');


describe('middleware/deny_ip', function(){

})