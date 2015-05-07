'use strict';

var thinkjs = require('../../index.js');
var assert = require('assert');
var path = require('path');

var APP_PATH = path.dirname(__dirname);

thinkjs({
  APP_PATH: APP_PATH,
  debug: false
}).run();

var _think = {};

beforeEach(function() {
  think.extend(_think, think);
});

afterEach(function() {
  global.think = _think;
});

describe('core/think', function() {

  it.skip('think.Class', function() {
    var c, o, e,
        foo = 'foo',
        bar = 'bar',
        obj = {foo: foo},
        http = {},
        fun = function() {};

    fun.prototype.init = function(bar) {
      this.bar = bar;
    };

    c = think.Class(obj);
    o = c(http);
    assert.equal(o.foo, obj.foo);
    assert.equal(o.http, http);
    assert.equal(c.super_, think.Base);

    c = think.Class(obj, true);
    o = c();
    assert.equal(o.foo, obj.foo);
    assert.equal(typeof c.super_, 'undefined');

    c = think.Class(fun, obj);
    o = c(bar);
    assert.equal(o.foo, foo);
    assert.equal(o.bar, bar);

    e = think.Class('controller');

    c = e();
    o = c();
    //assert();

    c = e(obj);
    o = c();

    c = e('');
    o = c();

    assert.deepEqual(think.Class(fun, obj), e(fun, obj));

  });

  it('think.getModulePath', function() {
    think.mini = true;
    assert.equal(think.getModulePath(), APP_PATH);
    assert.equal(think.getModulePath('module'), APP_PATH);

    think.mini = false;
    assert.equal(think.getModulePath(), APP_PATH + '/common');
    assert.equal(think.getModulePath('module'), APP_PATH + '/module');
  });

  it('think.require', function() {

  });

  it('think.safeRequire', function() {
    var error = null,
        consoleError = console.error,
        debug = think.debug;

    console.error = function(e) {
      error = e;
    };

    assert.strictEqual(think.safeRequire('/xxx'), null);
    assert.strictEqual(error, null);

    think.debug = false;

    assert.strictEqual(think.safeRequire('xxx'), null);
    assert.strictEqual(error, null);

    think.debug = true;

    assert.strictEqual(think.safeRequire('xxx'), null);
    assert.notStrictEqual(error, null);
    assert(error.indexOf('Cannot find module'));

    console.error = consoleError;
    think.debug = debug;
  });

  it('think.log', function() {
    var consoleOutput;
    var consoleLog = console.log;

    console.log = function(data) {
      consoleOutput = data;
    };

    think.log('test');
    assert.equal(consoleOutput, 'test');

    think.log(new Error('test'));
    assert(consoleOutput.indexOf(__filename) > -1);

    console.log = consoleLog;
  });

  it('think.config', function() {
    var data = {},
        foo = 'foo',
        bar = 'bar',
        fooFoo = 'foo.foo',
        fooBar = 'foo.bar',
        obj = {foo: {foo: foo}, bar: bar};

    assert.equal(think.config(), think._config);

    think.config(foo, foo);
    assert.equal(think.config(foo), foo);
    assert.doesNotThrow(function() {
      think.config(fooBar);
    });

    think.config(obj);
    assert.equal(think.config(bar), bar);
    assert.equal(think.config(fooFoo), foo);
    assert.strictEqual(think.config(fooBar), undefined);

    think.config(fooBar, bar);
    assert.equal(think.config(fooBar), bar);

    think.config(fooBar, bar, data);
    assert.equal(data.foo.bar, bar);
  });

  it('think.getModuleConfig', function () {

  });

  it('think.hook', function () {

  });

  it('think.middleware', function () {

  });

  it('think.adapter', function () {

  });

  it('think.loadAdapter', function () {

  });

  it('think.alias', function () {

  });

  it('think.route', function () {
  });

  it('think.gc', function () {
    think.debug = false;
    think.mode = 'http';

    var instance = {
      gcType : 'test_gc',
      gc: function() {}
    };

    assert.throws(function() {
      think.gc({})
    }, think.message('GCTYPE_MUST_SET'));
  });

  it('think.http', function () {

  });

  it('think.uuid', function () {
    var uuid = think.uuid(),
        length = 16;

    assert(uuid.match(/^[a-z0-9_]{32}$/i));
    assert.notEqual(uuid, think.uuid());
    assert(think.uuid(length).length, length);
  });

  it('think.session', function () {

  });

  it('think.getModule', function () {
    var name = 'test_ABC';

    assert.deepEqual(think.getModule(), think.config('default_module'));
    assert.strictEqual(think.getController(name), name.toLowerCase());

  });

  it('think.getController', function () {
    var name = 'test_ABC',
        nameIllegal = '123_abc';

    assert.deepEqual(think.getController(), think.config('default_controller'));
    assert.strictEqual(think.getController(name), name.toLowerCase());
    assert.strictEqual(think.getController(nameIllegal), '');
  });

  it('think.getAction', function () {
    var name = 'test_ABC',
        nameIllegal = '123_abc';

    assert.deepEqual(think.getAction(), think.config('default_action'));
    assert.strictEqual(think.getAction(name), name);
    assert.strictEqual(think.getAction(nameIllegal), '');
  });

  it('think.message', function () {
    var type = 'PATH_EMPTY',
        arg = 'test',
        result = think._message[type].replace(/%s/, arg);

    assert.equal(think.message(type, arg), result);
    assert.equal(think.message(type, [arg]), result);
    assert.strictEqual(think.message(type + '_NOT_EXIST', arg), undefined);
  });

  it('think.cache', function () {

  });

  it('think.valid', function () {

  });

  it('thinkCache', function () {
    var type = 'test_cache',
        foo = 'foo',
        obj = {foo: foo};

    assert.deepEqual(thinkCache(type), {});
    assert.strictEqual(thinkCache(type, foo), undefined);

    thinkCache(type, foo, foo);
    assert.equal(thinkCache(type, foo), foo);

    thinkCache(type, foo, null);
    assert.strictEqual(thinkCache(type, foo), undefined);

    thinkCache(type, obj);
    assert.equal(thinkCache(type, foo), foo);
  });

});