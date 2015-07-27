
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Cookie = require('../../lib/util/cookie.js');

describe('Cookie', function(){
  describe('stringify', function(){
    it('base', function(){
      assert.strictEqual(Cookie.stringify('welefen', 'suredy'), 'welefen=suredy')
    })
    it('maxage', function(){
      assert.strictEqual(Cookie.stringify('welefen', 'suredy', {
        maxage: 1000
      }), 'welefen=suredy; Max-Age=1000')
    })
    it('path', function(){
      assert.strictEqual(Cookie.stringify('welefen', 'suredy', {
        path: '/'
      }), 'welefen=suredy; Path=/')
    })
    it('domain', function(){
      assert.strictEqual(Cookie.stringify('welefen', 'suredy', {
        domain: 'www.welefen.com'
      }), 'welefen=suredy; Domain=www.welefen.com')
    })
    it('expires', function(){
      assert.strictEqual(Cookie.stringify('welefen', 'suredy', {
        expires: 1404608898836
      }), 'welefen=suredy; Expires=Sun, 06 Jul 2014 01:08:18 GMT')
    })
    it('expires', function(){
      assert.strictEqual(Cookie.stringify('welefen', 'suredy', {
        expires: new Date(1404608898836)
      }), 'welefen=suredy; Expires=Sun, 06 Jul 2014 01:08:18 GMT')
    })
    it('httponly', function(){
      assert.strictEqual(Cookie.stringify('welefen', 'suredy', {
        httponly: true
      }), 'welefen=suredy; HttpOnly')
    })
    it('secure', function(){
      assert.strictEqual(Cookie.stringify('welefen', 'suredy', {
        secure: true
      }), 'welefen=suredy; Secure')
    })
    it('escape', function(){
      assert.strictEqual(Cookie.stringify('welefen', '+ '), 'welefen=%2B%20')
    })
    it('parse->serialize', function(){
      assert.deepEqual({ cat: 'foo=123&name=baz five' }, Cookie.parse(
        Cookie.stringify('cat', 'foo=123&name=baz five')));

      assert.deepEqual({ cat: ' ";/' }, Cookie.parse(
        Cookie.stringify('cat', ' ";/')));
    })
  })

  describe('parse', function(){
    it('empty', function() {
      assert.deepEqual({ }, Cookie.parse(''));
    });
    it('basic', function() {
      assert.deepEqual({ foo: 'bar' }, Cookie.parse('foo=bar'));
      assert.deepEqual({ foo: '123' }, Cookie.parse('foo=123'));
    });

    it('ignore spaces', function() {
        assert.deepEqual({ FOO: 'bar', baz: 'raz' },Cookie.parse('FOO    = bar;   baz  =   raz'));
    });

    it('escaping', function() {
      assert.deepEqual({ foo: 'bar=123456789&name=Magic+Mouse' },Cookie.parse('foo="bar=123456789&name=Magic+Mouse"'));
      assert.deepEqual({ email: ' ",;/' },Cookie.parse('email=%20%22%2c%3b%2f'));
    });

    it('ignore escaping error and return original value', function() {
      assert.deepEqual({ foo: '%1', bar: 'bar' }, Cookie.parse('foo=%1;bar=bar'));
    });

    it('ignore non values', function() {
      assert.deepEqual({ foo: '%1', bar: 'bar' }, Cookie.parse('foo=%1;bar=bar;HttpOnly;Secure'));
    });
    it('multi name', function() {
      assert.deepEqual({ foo: '%1'}, Cookie.parse('foo=%1;foo=bar;HttpOnly;Secure'));
    });

    it('unencoded', function() {
      //console.log(Cookie.parse('foo="bar=123456789&name=Magic+Mouse"'))
      assert.deepEqual({ foo: 'bar=123456789&name=Magic+Mouse' },
              Cookie.parse('foo="bar=123456789&name=Magic+Mouse"'));
      assert.deepEqual({ email: ' ",;/' },
              Cookie.parse('email=%20%22%2c%3b%2f'));
    });

    it('dates', function() {
      assert.deepEqual({ priority: 'true', Path: '/', expires: 'Wed, 29 Jan 2014 17:43:25 GMT' },
                Cookie.parse('priority=true; expires=Wed, 29 Jan 2014 17:43:25 GMT; Path=/'));
    })
  })

  describe('sign', function(){
    it('empty', function(){
      var value = Cookie.sign('welefen', '');
      assert.equal(value, 'welefen.UthE8HFHAwwVvVeKLfdru498tuosJ7l6/XAsX2FIvc4')
    })
    it('sign is undefined', function(){
      var value = Cookie.sign('welefen');
      assert.equal(value, 'welefen.UthE8HFHAwwVvVeKLfdru498tuosJ7l6/XAsX2FIvc4')
    })
    it('base', function(){
      var value = Cookie.sign('welefen', 'suredy');
      assert.equal(value, 'welefen.mdfZWmigjfgTv3+xqNBeCLxCxq1ZVjdrDvC5J5VR2oI')
    })
  })
  describe('unsign', function(){
    it('base', function(){
      var value = Cookie.unsign('welefen.mdfZWmigjfgTv3+xqNBeCLxCxq1ZVjdrDvC5J5VR2oI', 'suredy');
      assert.equal(value, 'welefen');
    })
    it('error', function(){
      var value = Cookie.unsign('welefen.mdfZWmigjfgTv3+xqNBeCLxCxq1ZVjdrDvC5J5VR2oI111', 'suredy');
      assert.equal(value, '');
    })
  })
})