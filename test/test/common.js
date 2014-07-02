/**
 * lib/Common/common.js里函数的测试
 */
require('../../lib/Common/common.js');
var fs = require('fs');
var should = require('should');
var assert = require('assert');

/**
 * 动态创建类
 * @return {[type]} [description]
 */
describe('Class', function(){
  var A = Class(function(){
    return {
      init: function(){

      },
      value: 'A',
      fn: function(){},
      fn2: function(){
        return this.value;
      },
      fn4: function(){
        return this.value;
      },
      data: {
        name: 'CLASS A'
      }
    }
  });

  var B = Class({
    value2: 'B',
    fn2: function(){
      var p = this.super("fn2");
      return p + this.value2;
    },
    fn3: function(){
      this.super("fn3");
      return this.value;
    },
    fn4: function(){
      return this.value;
    },
    fn6: function(){
      return this.super('fn5')
    },
    data: {
      name: 'CLASS B'
    }
  }, A);

  var C = Class({
    value: 'C',
    fn2: function(){
      var p = this.super("fn2");
      return p + this.value + this.value2;
    },
    fn5: function(){
      return this.super("fn4");
    },
    data: {
      name: 'CLASS C'
    }
  }, B)

  var D = Class(A, true);

  var a = A();
  var b = B();
  var c = C();
  var d = D();
  it('a.value = "A"', function(){
    assert.equal(a.value, 'A');
  })
  it('isFunction(a.fn) = true', function(){
    assert.equal(isFunction(a.fn), true)
  })
  it('b.value = "A"', function(){
    assert.equal(b.value, 'A')
  })
  it('b.value2 = "B"', function(){
    assert.equal(b.value2, 'B');
  })
  it('b.fn = a.fn', function(){
    assert.equal(a.fn, b.fn)
  })
  it('c.value = "C"', function(){
    assert.equal(c.value, 'C')
  })
  it('c.value2 = "B"', function(){
    assert.equal(c.value2, "B");
  })
  it('c.fn = a.fn', function(){
    assert.equal(a.fn, c.fn)
  })
  it('a.fn2() = "A"', function(){
    assert.equal(a.fn2(), 'A');
  })
  it('b.fn2() = "AB"', function(){
    assert.equal(b.fn2(), 'AB');
  })
  it('c.fn2() = "CBCB"', function(){
    assert.equal(c.fn2(), 'CBCB')
  })
  it('a.data', function(){
    assert.equal(JSON.stringify(a.data), '{"name":"CLASS A"}')
  })
  it('A.prototype.data', function(){
    assert.equal(A.prototype.data, undefined)
    assert.equal(JSON.stringify(A.__prop.data), '{"name":"CLASS A"}')
  })
  it('d.value = "A"', function(){
    assert.equal(d.value, 'A');
  })
  it('b.fn3() = "A"', function(){
    assert.equal(b.fn3(), 'A')
  })
  it('c.fn5() = "C"', function(){
    assert.equal(c.fn5(), 'C');
  })
  it('b.fn6() = undefined', function(){
    assert.equal(b.fn6(), undefined)
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
  var f = function(){
    return {
      name: 5
    }
  }
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
  it('a.name = 5', function(){
    a = {};
    extend(a, f);
    assert.equal(a.name, 5);
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
  it('isBoolean(undefined) = false', function(){
    assert.equal(isBoolean(), false);
  })
  it('isBoolean(null) = false', function(){
    assert.equal(isBoolean(null), false);
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
  it('isNumber(0) = true', function(){
    assert.equal(isNumber(0), true);
  })
  it('isNumber(1.1) = true', function(){
    assert.equal(isNumber(1.1), true);
  })
  it('isNumber(-1.1) = true', function(){
    assert.equal(isNumber(-1.1), true);
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
  it('isObject([]) = false', function(){
    assert.equal(isObject([]), false)
  })
  it('isObject(new Buffer(11)) = false', function(){
    assert.equal(isObject(new Buffer(11)), false)
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
  it('isFunction(a) = true', function(){
    function a(){}
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
  it('isDate(Date.now()) = false', function(){
    assert.equal(isDate(Date.now()), false)
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
  it('isRegexp(/\w+/g) = true', function(){
    assert.equal(isRegexp(/\w+/g), true)
  })
  it('isRegexp(/\w+/i) = true', function(){
    assert.equal(isRegexp(/\w+/i), true)
  })
  it('isRegexp(/\w+/m) = true', function(){
    assert.equal(isRegexp(/\w+/m), true)
  })
  it('isRegexp(/\w+/img) = true', function(){
    assert.equal(isRegexp(/\w+/img), true)
  })
  it('isRegexp(new RegExp("\w+")) = true', function(){
    assert.equal(isRegexp(new RegExp("\w+")), true)
  })
  it('isRegexp(new RegExp("\w+", "i")) = true', function(){
    assert.equal(isRegexp(new RegExp("\w+", "i")), true)
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
  it('isEmpty({name: 1}) = false', function(){
    assert.equal(isEmpty({name: 1}), false);
  })
  it('isEmpty(null) = true', function(){
    assert.equal(isEmpty(null), true)
  })
  it('isEmpty(undefined) = true', function(){
    assert.equal(isEmpty(undefined), true)
  })
  it('isEmpty(function(){}) = false', function(){
    assert.equal(isEmpty(function(){}), false)
  })
})

describe('isScalar', function(){
  it('isScalar(1) = true', function(){
    assert.equal(isScalar(1), true);
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
/**
 * 是否是目录
 * @return {[type]} [description]
 */
describe('isDir', function(){
  var dir = "test.a";
  it('isDir("' + dir + '"") = false', function(){
    assert.equal(isDir(dir), false);
  })
  it('isDir("' + dir + '"") = true', function(){
    mkdir(dir);
    assert.equal(isDir(dir), true);
    fs.rmdirSync(dir);
  })
  it('isDir("' + dir + '"") = false', function(){
    fs.writeFileSync(dir, "");
    assert.equal(isDir(dir), false);
    fs.unlinkSync(dir);
  })
})
/**
 * 是否可写
 * @return {[type]} [description]
 */
describe('isWritable', function(){
  it('isWritable("test/") = true', function(){
    assert.equal(isWritable('test/'), true)
  })
  it('isWritable("/usr/local/testxxx") = false', function(){
    assert.equal(isWritable('/usr/local/testxxx'), false)
  })
  it('isWritable("/usr/sbin/sshd") = false', function(){
    assert.equal(isWritable('/usr/sbin/sshd'), false)
  })
})
/**
 * 大写首字母
 * @return {[type]} [description]
 */
describe('ucfirst', function(){
  it('ucfirst("") = ""', function(){
    assert.equal(ucfirst(""), "")
  })
  it('ucfirst("welefen") = "Welefen"', function(){
    assert.equal(ucfirst('welefen'), 'Welefen')
  })
  it('ucfirst("WELEFEN") = "Welefen"', function(){
    assert.equal(ucfirst('WELEFEN'), 'Welefen')
  })
  it('ucfirst("WELEFEN SUREDY") = "Welefen suredy"', function(){
    assert.equal(ucfirst('WELEFEN SUREDY'), 'Welefen suredy')
  })
  it('ucfirst({}) = "[object object]"', function(){
    assert.equal(ucfirst({}), '[object object]')
  })
  it('ucfirst() = ""', function(){
    assert.equal(ucfirst(), '');
  })
})
/**
 * 是否是字符型数字
 * @return {[type]} [description]
 */
describe('isNumberString', function(){
  it('isNumberString(1) = true', function(){
    assert.equal(isNumberString(1), true)
  })
  it('isNumberString("1") = true', function(){
    assert.equal(isNumberString("1"), true)
  })
  it('isNumberString("1.5") = true', function(){
    assert.equal(isNumberString("1.5"), true)
  })
  it('isNumberString("-1.5") = true', function(){
    assert.equal(isNumberString("-1.5"), true)
  })
  it('isNumberString("0") = true', function(){
    assert.equal(isNumberString("0"), true)
  })
  it('isNumberString("1.0E10") = true', function(){
    assert.equal(isNumberString("1.0E10"), true)
  })
  it('isNumberString("1.0E-10") = true', function(){
    assert.equal(isNumberString("1.0E-10"), true)
  })
  it('isNumberString("1E-10") = true', function(){
    assert.equal(isNumberString("1E-10"), true)
  })
})
/**
 * 字符md5
 * @return {[type]} [description]
 */
describe('md5', function(){
  it('md5() = "5e543256c480ac577d30f76f9120eb74"', function(){
    assert.equal(md5(), '5e543256c480ac577d30f76f9120eb74');
  })
  it('md5("welefen") = "d044be314c409f92c3ee66f1ed8d3753"', function(){
    assert.equal(md5('welefen'), 'd044be314c409f92c3ee66f1ed8d3753')
  })
})
/**
 * 是否是Promise
 * @return {[type]} [description]
 */
describe('isPromise', function(){
  it('isPromise() = false', function(){
    assert.equal(isPromise(), false)
  })
  it('isPromise({}) = false', function(){
    assert.equal(isPromise({}), false);
  })
  it('isPromise(function(){}) = false', function(){
    assert.equal(isPromise(function(){}), false)
  })
  it('isPromise(getPromise()) = true', function(){
    assert.equal(isPromise(getPromise()), true)
  })
  it('isPromise(getPromise("", true)) = true', function(){
    assert.equal(isPromise(getPromise('', true)), true)
  })
})
/**
 * 生成一个Promise
 * @return {[type]} [description]
 */
describe('getPromise', function(){
  it('getPromise()', function(done){
    getPromise().then(function(data){
      assert.equal(data, undefined);
      done();
    })
  });
  it('getPromise("welefen")', function(done){
    getPromise('welefen').then(function(data){
      assert.equal(data, 'welefen');
      done();
    })
  })
  it('getPromise("error", true)', function(done){
    getPromise('error', true).catch(function(err){
      assert.equal(err, 'error');
      done();
    })
  })
  it('getPromise(promise)', function(done){
    var promise = getPromise('data');
    getPromise(promise).then(function(data){
      assert.equal(data, 'data');
      done();
    })
  })
})

describe('getDefer', function(){
  it('getDefer()', function(){
    var deferred = getDefer();
    assert.equal(isObject(deferred.promise), true);
    assert.equal(isFunction(deferred.resolve), true);
    assert.equal(isFunction(deferred.reject), true)
    assert.equal(isFunction(deferred.promise.then), true);
    assert.equal(isFunction(deferred.promise.catch), true);
  })
})


describe('getObject', function(){
  it('getObject()', function(){
    assert.equal(JSON.stringify(getObject()), '{}');
  })
  it('getObject("welefen", "suredy")', function(){
    var data = getObject('welefen', 'suredy');
    assert.equal(data.welefen, 'suredy')
    assert.equal(Object.keys(data).join(''), 'welefen')
  })
  it('getObject(["name", "value"], ["welefen", "1"])', function(){
    var data = getObject(['name', 'value'], ['welefen', '1']);
    assert.equal(data.name, 'welefen');
    assert.equal(data.value, '1');
    assert.equal(JSON.stringify(data), '{"name":"welefen","value":"1"}')
  })
  it('getObject(["name", "value"], ["welefen"])', function(){
    var data = getObject(['name', 'value'], ['welefen'])
    assert.equal(JSON.stringify(data), '{"name":"welefen"}');
    assert.equal(data.value, undefined)
  })
  it('getObject(["name"], ["welefen", 1])', function(){
    var data = getObject(['name'], ['welefen', 1]);
    assert.equal(JSON.stringify(data), '{"name":"welefen"}')
  })
})

describe('arrToObj', function(){
  var data = [{
    name: 'welefen',
    value: 1
  }, {
    name: 'suredy',
    value: 2
  }]
  it('arrToObj("name")', function(){
    var res = arrToObj(data, 'name');
    assert.equal(JSON.stringify(res), '{"welefen":{"name":"welefen","value":1},"suredy":{"name":"suredy","value":2}}')
  })
  it('arrToObj("name", "value")', function(){
    var res = arrToObj(data, 'name', 'value');
    assert.equal(JSON.stringify(res), '{"welefen":1,"suredy":2}')
  })
  it('arrToObj("name", null)', function(){
    var res = arrToObj(data, 'name', null);
    assert.equal(JSON.stringify(res), '["welefen","suredy"]')
  })
  it('arrToObj("value", null)', function(){
    var res = arrToObj(data, 'value', null);
    assert.equal(JSON.stringify(res), '[1,2]')
  })
})