const test = require('ava');
const util = require('../loader/util.js');
const mock = require('mock-require');

const interopRequire = util.interopRequire;

test('obj is not a string, __esModule=false', t=>{
    var result = interopRequire({__esModule: false, a: 1});
    t.deepEqual(result, {__esModule: false, a: 1});
});


test('obj is not a string, __esModule=true', t=>{
    var result = interopRequire({__esModule: true, a: 1});
    t.is(result, undefined);
});

test('obj is string, not safe require, module not found', t=>{
    t.throws(()=>{
      var result = interopRequire('./a', false);
    }, Error);
});

test('obj is string, not safe require', t=>{
    mock('../a', {__esModule: false, a: 1});
    var result = interopRequire('./a', false);
    t.deepEqual(result, {__esModule: false, a: 1});
});


test('obj is string, not safe require, __esModule=true', t=>{
    mock('../a', {__esModule: true, default: 'default'});
    var result = interopRequire('./a', false);
    t.deepEqual(result, 'default');
});

test('obj is string, safe require module not found', t=>{
    var result = interopRequire('./a-not-found', true);
    t.deepEqual(result, null);
});

test('obj is string, safe require', t=>{
    mock('../a', {__esModule: false, a: 1});
    var result = interopRequire('./a', true);
    t.deepEqual(result, {__esModule: false, a: 1});
});

test('obj is string, safe require, __esModule=true', t=>{
    mock('../a', {__esModule: true, default: 'default'});
    var result = interopRequire('./a', true);
    t.deepEqual(result, 'default');
});