/**
 * lib/Common/common.js里函数的测试
 */
require('../lib/Common/common.js');
var fs = require('fs');
var should = require('should');
var assert = require('assert');

describe('Class', function(){
  it('xxx', function(){
    (1).should.equal(1);
  })
})

/**
 * extend 函数
 * @return {[type]} [description]
 */
describe('extend', function(){
  var a = {};
  var b = {name: 1, value: undefined};
  var c = {name: 2, value: 'value'};
  var d = {name: {name: 1}, value: {value: 2}};
  var e = {name: [1, 2, 3]};
  it('a stringify1', function(){
    extend(a, b);
    assert.equal(JSON.stringify(a), '{"name":1}');
  })
  it('a stringify2', function(){
    extend(a, c);
    assert.equal(JSON.stringify(a), '{"name":2,"value":"value"}')
  })
  it('a stringify3', function(){
    extend(a, d);
    assert.equal(JSON.stringify(a), '{"name":{"name":1},"value":{"value":2}}')
  })
  it('a.name.name is 1', function(){
    d.name.name = 2;
    assert.equal(a.name.name, 1);
  })
  it('a.name.name is 2', function(){
    a = {};
    extend(false, a, d);
    d.name.name = 2;
    assert.equal(a.name.name, 2);
  })
  it('a.name stringify', function(){
    a = {};
    extend(a, e);
    assert.equal(JSON.stringify(a), '{"name":[1,2,3]}')
  })
  it('a.name[0] is 3', function(){
    a = {};
    extend(false, a, e);
    e.name[0] = 3;
    assert.equal(a.name[0], 3);
  })
})

/**
 * 是否是布尔型
 * @return {[type]} [description]
 */
describe('isBoolean', function(){
  it('isBoolean(true) = true', function(){
    assert.equal(isBoolean(true), true);
  })
  it('isBoolean(false) = true', function(){
    assert.equal(isBoolean(false), true);
  })
  it('isBoolean(1) = false', function(){
    assert.equal(isBoolean(1), false);
  })
  it('isBoolean([]) = false', function(){
    assert.equal(isBoolean([]), false);
  })
  it('isBoolean(new Boolean(true)) = true', function(){
    assert.equal(isBoolean(new Boolean(true)), true);
  })
  it('isBoolean(new Boolean(false)) = true', function(){
    assert.equal(isBoolean(new Boolean(false)), true);
  })
  it('isBoolean({}) = false', function(){
    assert.equal(isBoolean({}), false);
  })
})

/**
 * 是否是数字
 * @return {[type]} [description]
 */
describe('isNumber', function(){
  it('isNumber(1) = true', function(){
    assert.equal(isNumber(1), true);
  })
  it('isNumber(1.1) = true', function(){
    assert.equal(isNumber(1.1), true);
  })
  it('isNumber(0) = true', function(){
    assert.equal(isNumber(0), true);
  })
  it('isNumber(NaN) = true', function(){
    assert.equal(isNumber(NaN), true);
  })
  it('isNumber(Infinity) = true', function(){
    assert.equal(isNumber(Infinity), true);
  })
  it('isNumber(1.0E10) = true', function(){
    assert.equal(isNumber(1.0E10), true);
  })
  it('isNumber(1.0E-10) = true', function(){
    assert.equal(isNumber(1.0E-10), true);
  })
  it('isNumber("1") = false', function(){
    assert.equal(isNumber("1"), false);
  })
  it('isNumber({}) = false', function(){
    assert.equal(isNumber({}), false);
  })
  it('isNumber(Number("1")) = true', function(){
    assert.equal(isNumber(Number("1")), true);
  })
})

/**
 * 是否是对象
 * @return {[type]} [description]
 */
describe('isObject', function(){
  it('isObject({}) = true', function(){
    assert.equal(isObject({}), true)
  })
  it('isObject(new Object()) = true', function(){
    assert.equal(isObject(new Object()), true)
  })
  it('isObject("") = false', function(){
    assert.equal(isObject(""), false)
  })
})

/**
 * 是否是字符串
 * @return {[type]} [description]
 */
describe('isString', function(){
  it('isString("") = true', function(){
    assert.equal(isString(""), true);
  })
  it('isString(new String("")) = true', function(){
    assert.equal(isString(new String("")), true);
  })
  it('isString({}) = false', function(){
    assert.equal(isString({}), false);
  })
})

/**
 * 是否是函数
 * @return {[type]} [description]
 */
describe('isFunction', function(){
  it('isFunction(function(){}) = true', function(){
    assert.equal(isFunction(function(){}), true);
  })
  it('isFunction(new Function()) = true', function(){
    assert.equal(isFunction(new Function("")), true)
  })
  it('isFunction(a) = true', function(){
    var a = function(){}
    assert.equal(isFunction(a), true);
  })
  it('isFunction({}) = false', function(){
    assert.equal(isFunction({}), false);
  })
})
/**
 * 是否是日期
 * @return {[type]} [description]
 */
describe('isDate', function(){
  it('isDate(new Date())', function(){
    assert.equal(isDate(new Date), true)
  })
  it('isDate(12121212) = false', function(){
    assert.equal(isDate(1212121), false)
  })
})
/**
 * 是否是正则
 * @return {[type]} [description]
 */
describe('isRegexp', function(){
  it('isRegexp(/\w+/) = true', function(){
    assert.equal(isRegexp(/\w+/), true)
  })
  it('isRegexp(new RegExp("\w+")) = true', function(){
    assert.equal(isRegexp(new RegExp("\w+")), true)
  })
})
/**
 * 是否是错误
 * @return {[type]} [description]
 */
describe('isError', function(){
  it('isError(new Error) = true', function(){
    assert.equal(isError(new Error), true);
  })
  it('isError(new URIError) = true', function(){
    assert.equal(isError(new URIError), true);
  })
})
/**
 * 是否为空
 * @return {[type]} [description]
 */
describe('isEmpty', function(){
  it('isEmpty(0) = true', function(){
    assert.equal(isEmpty(0), true);
  })
  it('isEmpty(1) = false', function(){
    assert.equal(isEmpty(1), false);
  })
  it('isEmpty(false) = true', function(){
    assert.equal(isEmpty(false), true);
  })
  it('isEmpty(true) = false', function(){
    assert.equal(isEmpty(true), false);
  })
  it('isEmpty("") = true', function(){
    assert.equal(isEmpty(""), true)
  })
  it('isEmpty("0") = false', function(){
    assert.equal(isEmpty('0'), false);
  })
  it('isEmpty([]) = true', function(){
    assert.equal(isEmpty([]), true)
  })
  it('isEmpty({}) = true', function(){
    assert.equal(isEmpty({}), true);
  })
  it('isEmpty(null) = true', function(){
    assert.equal(isEmpty(null), true)
  })
  it('isEmpty(undefined) = true', function(){
    assert.equal(isEmpty(undefined), true)
  })
})
/**
 * 是否是个文件
 * @return {[type]} [description]
 */
describe('isFile', function(){
  it('isFile("test.a") = false', function(){
    assert.equal(isFile("test.a"), false)
  })
  it('isFile("test.a.txt") = true', function(){
    fs.writeFileSync('test.a.txt', "");
    assert.equal(isFile('test.a.txt'), true)
    fs.unlinkSync('test.a.txt');
  })
  it('isFile("test.a/") = false', function(){
    assert.equal(isFile('test.a/'), false);
  })
  it('isFile("test.b/") = true', function(){
    fs.mkdirSync('test.b/');
    assert.equal(isFile('test.b/'), false);
    fs.rmdirSync('test.b/');
  })
})

describe('isDir', function(){

})