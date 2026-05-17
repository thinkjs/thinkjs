var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var pagenation = require('../index.js');

describe ('pagenation', function() {
  it ('totalPages = 1', function() {
    var html = pagenation({totalPages: 1});
    assert.equal(html, '');
  });
  // it('totalPages > 1', function(){
  //   var html = pagenation({totalPages: 2}, {
  //     query: {}
  //   });
  //   console.log(html)
  // })
});
