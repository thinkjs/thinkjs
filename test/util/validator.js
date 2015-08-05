var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Validate = require('../../lib/util/validator.js');

describe('Validate', function(){
  it('is object', function(){
    assert.equal(think.isObject(Validate), true)
  })
  it('length: emtpy', function(){
    assert.equal(Validate.length(), true);
  })
  it('length: emtpy, min 1', function(){
    assert.equal(Validate.length('', 1), false);
  })
  it('length, min 1', function(){
    assert.equal(Validate.length('welefen', 1), true);
  })
  it('length, min 1, max 10', function(){
    assert.equal(Validate.length('welefen', 1, 10), true);
  })
  it('length, min 1, max 3', function(){
    assert.equal(Validate.length('welefen', 1, 3), false);
  })
  it('required', function(){
    assert.equal(Validate.required('welefen'), true);
  })
  it('required emtpy', function(){
    assert.equal(Validate.required(''), false);
  })
  it('required emtpy', function(){
    assert.equal(Validate.required(), false);
  })
  it('regexp success', function(){
    assert.equal(Validate.regexp('welefen', /\w+/), true);
  })
  it('regexp fail', function(){
    assert.equal(Validate.regexp('welefen', /\d+/), false);
  })
  it('email', function(){
    assert.equal(Validate.email('welefen@gmail.com'), true);
  })
  it('email fail', function(){
    assert.equal(Validate.email('welefengmail.com'), false);
  })
  it('time', function(){
    assert.equal(Validate.time(Date.now()), true);
  })
  it('cname', function(){
    assert.equal(Validate.cname('你好'), true);
  })
  it('id number', function(){
    assert.equal(Validate.idnumber('34242519861211833X'), true);
  })
  it('id number fail', function(){
    assert.equal(Validate.idnumber('342425198612118331'), false);
  })
  it('id number fail', function(){
    assert.equal(Validate.idnumber('fasdfasdf'), false);
  })
  it('id number 15', function(){
    assert.equal(Validate.idnumber('342425198612118'), true);
  })
  it('mobile', function(){
    assert.equal(Validate.mobile('15811300250'), true);
  })
  it('zipcode', function(){
    assert.equal(Validate.zipcode('231347'), true);
  })
  it('zipcode', function(){
    assert.equal(Validate.confirm('231347', '231347'), true);
  })
  it('url', function(){
    assert.equal(Validate.url('http://welefen.com'), true);
  })
  it('int', function(){
    assert.equal(Validate.int(12121), true);
  })
  it('float', function(){
    assert.equal(Validate.float(12121.1212), true);
  })
  it('range', function(){
    assert.equal(Validate.range(100, 0, 1000), true);
  })
  it('range, not number', function(){
    assert.equal(Validate.range('fadf', 0, 1000), false);
  })
  it('range, min', function(){
    assert.equal(Validate.range(10, 30, 1000), false);
  })
  it('range, max', function(){
    assert.equal(Validate.range(110, 30, 100), false);
  })
  it('ip4', function(){
    assert.equal(Validate.ip4('192.168.1.1'), true);
  })
  it('ip6', function(){
    assert.equal(Validate.ip6('2031:0000:1F1F:0000:0000:0100:11A0:ADDF'), true);
  })
  it('ip', function(){
    assert.equal(Validate.ip('192.168.1.1'), true);
  })
  it('ip', function(){
    assert.equal(Validate.ip('2031:0000:1F1F:0000:0000:0100:11A0:ADDF'), true);
  })
  it('date', function(){
    assert.equal(Validate.date('2015-07-15'), true);
  })
  it('in', function(){
    assert.equal(Validate.in('1', ['1']), true);
  })
  it('order', function(){
    assert.equal(Validate.order('name ASC, id DESC'), true);
  })
  it('order fail', function(){
    assert.equal(Validate.order(''), false);
  })
  it('field', function(){
    assert.equal(Validate.field('*'), true);
  })
  it('field', function(){
    assert.equal(Validate.field('name,*'), true);
  })
  it('field fail', function(){
    assert.equal(Validate.field('name-www,*'), false);
  })

})