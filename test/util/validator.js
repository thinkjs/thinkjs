'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var thinkit = require('thinkit');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';


var Validator = require('../../lib/util/validator.js');

describe('Validator', function(){
  it('is object', function(){
    assert.equal(think.isObject(Validator), true)
  })
  it('required', function(){
    assert.equal(Validator.required('welefen'), true);
  })
  it('contains fail', function(){
    assert.equal(Validator.contains('welefen', 'sss'), false);
  })
  it('contains success', function(){
    assert.equal(Validator.contains('welefen', 'wele'), true);
  })
  it('equals fail', function(){
    assert.equal(Validator.equals('welefen', 'sss'), false);
  })
  it('equals success', function(){
    assert.equal(Validator.equals('welefen', 'welefen'), true);
  })
  it('different fail', function(){
    assert.equal(Validator.different('welefen', 'welefen'), false);
  })
  it('different success', function(){
    assert.equal(Validator.different('welefen', 'wwww'), true);
  })
  it('after success', function(){
    var date = '2055-09-11 13:22:00'
    assert.equal(Validator.after(date), true);
  })
  it('after fail', function(){
    var date = '1955-09-11 13:22:00'
    assert.equal(Validator.after(date), false);
  })
  it('after success 1', function(){
    var date = '1955-09-11 13:22:00'
    assert.equal(Validator.after(date, '1945-09-11 13:22:00'), true);
  })
  it('required emtpy', function(){
    assert.equal(Validator.required(''), false);
  })
  it('required emtpy', function(){
    assert.equal(Validator.required(), false);
  })
  it('length: emtpy', function(){
    assert.equal(Validator.length(), false);
  })
  it('length: emtpy, min 1', function(){
    assert.equal(Validator.length('', 1), false);
  })
  it('length, min 1', function(){
    assert.equal(Validator.length('welefen', 1), true);
  })
  it('length, min 1, max 10', function(){
    assert.equal(Validator.length('welefen', 1, 10), true);
  })
  it('length, min 1, max 3', function(){
    assert.equal(Validator.length('welefen', 1, 3), false);
  })
  it('email', function(){
    assert.equal(Validator.email('welefen@gmail.com'), true);
  })
  it('email fail', function(){
    assert.equal(Validator.email('welefengmail.com'), false);
  })
  it('mobile', function(){
    assert.equal(Validator.mobile('15811300250'), true);
  })
  it('url', function(){
    assert.equal(Validator.url('http://welefen.com'), true);
  })
  it('int', function(){
    assert.equal(Validator.int(12121), true);
  })
  it('float', function(){
    assert.equal(Validator.float(12121.1212), true);
  })
  it('ip4', function(){
    assert.equal(Validator.ip4('192.168.1.1'), true);
  })
  it('ip6', function(){
    assert.equal(Validator.ip6('2031:0000:1F1F:0000:0000:0100:11A0:ADDF'), true);
  })
  it('ip', function(){
    assert.equal(Validator.ip('192.168.1.1'), true);
  })
  it('ip', function(){
    assert.equal(Validator.ip('2031:0000:1F1F:0000:0000:0100:11A0:ADDF'), true);
  })
  it('date', function(){
    assert.equal(Validator.date('2015-07-15'), true);
  })
  it('in', function(){
    assert.equal(Validator.in('1', ['1']), true);
  })
  it('order', function(){
    assert.equal(Validator.order('name ASC, id DESC'), true);
  })
  it('order fail', function(){
    assert.equal(Validator.order(''), false);
  })
  it('field', function(){
    assert.equal(Validator.field('*'), true);
  })
  it('field', function(){
    assert.equal(Validator.field('name,*'), true);
  })
  it('field fail', function(){
    assert.equal(Validator.field('name-www,*'), false);
  })
  it('alpha', function(){
    assert.equal(Validator.alpha('welefen'), true);
  })
  it('alpha fail', function(){
    assert.equal(Validator.alpha('welefen1'), false);
  })
  it('alphaDash', function(){
    assert.equal(Validator.alphaDash('welef_Nn'), true);
  })
  it('alphaDash fail', function(){
    assert.equal(Validator.alphaDash('welef_Nn22'), false);
  })
  it('alphaNumeric', function(){
    assert.equal(Validator.alphaNumeric('welefNnwerwe1212'), true);
  })
  it('alphaNumeric fail', function(){
    assert.equal(Validator.alphaNumeric('welefNnw_erwe1212'), false);
  })
  it('alphaNumericDash', function(){
    assert.equal(Validator.alphaNumericDash('welefNnwer_we1212'), true);
  })
  it('alphaNumericDash fail', function(){
    assert.equal(Validator.alphaNumericDash('welefNn$$wer_we1212'), false);
  })
  it('ascii', function(){
    assert.equal(Validator.ascii('welefNnwer_we1212'), true);
  })
  it('ascii 1', function(){
    assert.equal(Validator.ascii('welefNnwer_we1$212'), true);
  })
  it('ascii fail', function(){
    assert.equal(Validator.ascii('welefNn￥wer_we1$212'), false);
  })
  it('base64', function(){
    assert.equal(Validator.base64((new Buffer('welefen')).toString('base64')), true);
  })
  it('base64 fail', function(){
    assert.equal(Validator.base64((new Buffer('fasdfasdfw23$$$')).toString('utf8')), false);
  })
  it('before fail', function(){
    var date = '2142-11-11 11:12:13'
    assert.equal(Validator.before(date), false);
  })
  it('before', function(){
    var date = '2002-11-11 11:12:13'
    assert.equal(Validator.before(date), true);
  })
  it('byteLength', function(){
    assert.equal(Validator.byteLength('welefen', 2, 10), true);
  })
  it('creditcard', function(){
    assert.equal(Validator.creditcard('6226090109493516'), false);
  })
  it('currency', function(){
    assert.equal(Validator.currency('$128'), true);
  })
  it('date', function(){
    assert.equal(Validator.date('2015-09-11 11:33:10'), true);
  })
  it('decimal', function(){
    assert.equal(Validator.decimal('0.1'), true);
  })
  it('decimal 1', function(){
    assert.equal(Validator.decimal('.1'), true);
  })
  it('divisibleBy', function(){
    assert.equal(Validator.divisibleBy('10', 2), true);
  })
  it('email', function(){
    assert.equal(Validator.email('welefen@gmail.com'), true);
  })
  it('fqdn', function(){
    assert.equal(Validator.fqdn('gmail.com'), true);
  })
  it('fqdn 1', function(){
    assert.equal(Validator.fqdn('www.gmail.com'), true);
  })
  it('fqdn 2', function(){
    assert.equal(Validator.fqdn('ww-w.gmail.com'), true);
  })
  it('float NaN', function(){
    assert.equal(Validator.float(NaN), false);
  })
  it('float', function(){
    assert.equal(Validator.float('3.5'), true);
  })
  it('float, with min', function(){
    assert.equal(Validator.float('3.5', 3), true);
  })
  it('float, with max', function(){
    assert.equal(Validator.float('3.5', 3, 10), true);
  })
  it('fullWidth', function(){
    assert.equal(Validator.fullWidth('￥'), true);
  })
  it('fullWidth 1', function(){
    assert.equal(Validator.fullWidth('￥$$$'), true);
  })
  it('halfWidth', function(){
    assert.equal(Validator.halfWidth('￥$$'), true);
  })
  it('hexColor #000000', function(){
    assert.equal(Validator.hexColor('#000000'), true);
  })
  it('hexColor #000', function(){
    assert.equal(Validator.hexColor('#000'), true);
  })
  it('hexColor #fff', function(){
    assert.equal(Validator.hexColor('#fff'), true);
  })
  it('hex', function(){
    assert.equal(Validator.hex('a0a'), true);
  })
  it('isbn', function(){
    assert.equal(Validator.isbn('9787540471644'), true);
  })
  it('isin', function(){
    assert.equal(Validator.isin('9787540471644'), false);
  })
  it('iso8601', function(){
    assert.equal(Validator.iso8601('2011-09-11'), true);
  })
  it('in', function(){
    assert.equal(Validator.in('w', 'w'), true);
  })
  it('not in', function(){
    assert.equal(Validator.notIn('w', 'sw'), true);
  })
  it('int', function(){
    assert.equal(Validator.int(NaN), false);
  })
  it('int, with min', function(){
    assert.equal(Validator.int(10, 3), true);
  })
  it('int, with max', function(){
    assert.equal(Validator.int(10, 3, 10), true);
  })
  it('int, with max, float', function(){
    assert.equal(Validator.int(3.2, 3, 10), false);
  })
  it('min', function(){
    assert.equal(Validator.min(34, 3), true);
  })
  it('max', function(){
    assert.equal(Validator.max(4, 3), false);
  })
  it('minLength', function(){
    assert.equal(Validator.minLength('welefen', 3), true);
  })
  it('maxLength', function(){
    assert.equal(Validator.maxLength('welefen', 3), false);
  })
  it('lowercase', function(){
    assert.equal(Validator.lowercase('welefen'), true);
  })
  it('mobile', function(){
    assert.equal(Validator.mobile('13511200931'), true);
  })
  it('mobile, en-AU', function(){
    assert.equal(Validator.mobile('13511200931', 'en-AU'), false);
  })
  it('mongoId', function(){
    assert.equal(Validator.mongoId('13511200931'), false);
  })
  it('multibyte', function(){
    assert.equal(Validator.multibyte('$$$$$￥'), true);
  })
  it('url', function(){
    assert.equal(Validator.url('www.welefen.com/test'), false);
  })
  it('url, http', function(){
    assert.equal(Validator.url('http://www.welefen.com/test'), true);
  })
  it('url, https', function(){
    assert.equal(Validator.url('https://www.welefen.com/test'), true);
  })
  it('url, ftp', function(){
    assert.equal(Validator.url('ftp://www.welefen.com/test'), false);
  })
  it('uppercase', function(){
    assert.equal(Validator.uppercase('$$$$$￥'), true);
  })
  it('uppercase, fail', function(){
    assert.equal(Validator.uppercase('$$$$$￥w'), false);
  })
  it('variableWidth', function(){
    assert.equal(Validator.variableWidth('$$$$$￥w'), true);
  })
  it('image', function(){
    assert.equal(Validator.image('$$$$$￥w'), false);
  })
  it('image, jpg', function(){
    assert.equal(Validator.image('test.jpg'), true);
  })
  it('image, object', function(){
    assert.equal(Validator.image({
      originalFilename: 'test.jpg'
    }), true);
  })
  it('startWith', function(){
    assert.equal(Validator.startWith('test.jpg', 'test'), true);
  })
  it('endWith', function(){
    assert.equal(Validator.endWith('test.jpg', 'jpg'), true);
  })
  it('string', function(){
    assert.equal(Validator.string('test.jpg'), true);
  })
  it('array', function(){
    assert.equal(Validator.array(['test.jpg']), true);
  })
  it('array fail', function(){
    assert.equal(Validator.array('test.jpg'), false);
  })
  it('boolean', function(){
    assert.equal(Validator.boolean(true), true);
  })
  it('boolean fail', function(){
    assert.equal(Validator.boolean(false), false);
  })
})