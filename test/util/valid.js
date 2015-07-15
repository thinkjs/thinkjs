var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path')

var Valid = require('../../lib/util/valid.js');

describe('Valid', function(){
  it('is object', function(){
    assert.equal(think.isObject(Valid), true)
  })
  it('length: emtpy', function(){
    assert.equal(Valid.length(), true);
  })
  it('length: emtpy, min 1', function(){
    assert.equal(Valid.length('', 1), false);
  })
  it('length, min 1', function(){
    assert.equal(Valid.length('welefen', 1), true);
  })
  it('length, min 1, max 10', function(){
    assert.equal(Valid.length('welefen', 1, 10), true);
  })
  it('length, min 1, max 3', function(){
    assert.equal(Valid.length('welefen', 1, 3), false);
  })
  it('required', function(){
    assert.equal(Valid.required('welefen'), true);
  })
  it('required emtpy', function(){
    assert.equal(Valid.required(''), false);
  })
  it('required emtpy', function(){
    assert.equal(Valid.required(), false);
  })
  it('regexp success', function(){
    assert.equal(Valid.regexp('welefen', /\w+/), true);
  })
  it('regexp fail', function(){
    assert.equal(Valid.regexp('welefen', /\d+/), false);
  })
  it('email', function(){
    assert.equal(Valid.email('welefen@gmail.com'), true);
  })
  it('email fail', function(){
    assert.equal(Valid.email('welefengmail.com'), false);
  })
  it('time', function(){
    assert.equal(Valid.time(Date.now()), true);
  })
  it('cname', function(){
    assert.equal(Valid.cname('你好'), true);
  })
  it('id number', function(){
    assert.equal(Valid.idnumber('34242519861211833X'), true);
  })
  it('id number fail', function(){
    assert.equal(Valid.idnumber('342425198612118331'), false);
  })
  it('id number fail', function(){
    assert.equal(Valid.idnumber('fasdfasdf'), false);
  })
  it('id number 15', function(){
    assert.equal(Valid.idnumber('342425198612118'), true);
  })
  it('mobile', function(){
    assert.equal(Valid.mobile('15811300250'), true);
  })
  it('zipcode', function(){
    assert.equal(Valid.zipcode('231347'), true);
  })
  it('zipcode', function(){
    assert.equal(Valid.confirm('231347', '231347'), true);
  })
  it('url', function(){
    assert.equal(Valid.url('http://welefen.com'), true);
  })
  it('int', function(){
    assert.equal(Valid.int(12121), true);
  })
  it('float', function(){
    assert.equal(Valid.float(12121.1212), true);
  })
  it('range', function(){
    assert.equal(Valid.range(100, 0, 1000), true);
  })
  it('range, not number', function(){
    assert.equal(Valid.range('fadf', 0, 1000), false);
  })
  it('range, min', function(){
    assert.equal(Valid.range(10, 30, 1000), false);
  })
  it('range, max', function(){
    assert.equal(Valid.range(110, 30, 100), false);
  })
  it('ip4', function(){
    assert.equal(Valid.ip4('192.168.1.1'), true);
  })
  it('ip6', function(){
    assert.equal(Valid.ip6('2031:0000:1F1F:0000:0000:0100:11A0:ADDF'), true);
  })
  it('ip', function(){
    assert.equal(Valid.ip('192.168.1.1'), true);
  })
  it('ip', function(){
    assert.equal(Valid.ip('2031:0000:1F1F:0000:0000:0100:11A0:ADDF'), true);
  })
  it('date', function(){
    assert.equal(Valid.date('2015-07-15'), true);
  })
  it('in', function(){
    assert.equal(Valid.in('1', ['1']), true);
  })
  it('order', function(){
    assert.equal(Valid.order('name ASC, id DESC'), true);
  })
  it('order fail', function(){
    assert.equal(Valid.order(''), false);
  })
  it('field', function(){
    assert.equal(Valid.field('*'), true);
  })
  it('field', function(){
    assert.equal(Valid.field('name,*'), true);
  })

})