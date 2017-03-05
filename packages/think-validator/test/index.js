/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-05 17:51:16
*/
import test from 'ava';
import helper from 'think-helper';
import Validator from '../index.js';

test('rule-required', t => {
  let rules = {
    param: {
      required: true
    }
  }
  let instance = new Validator({});
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredIf', t => {
  let rules = {
    param: {
      requiredIf: ['name', 'lushijie', 'tom']
    }
  }
  let ctx = {
    name: 'lushijie'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredIf-false', t => {
  let rules = {
    param: {
      requiredIf: ['name2', 'lushijie', 'tom']
    }
  }
  let ctx = {
    name: 'lushijie'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredIf-noParam', t => {
  let rules = {
    param: {
      requiredIf: ['lushijie', '', 'tom']
    }
  }
  let instance = new Validator({});
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-requiredNotIf', t => {
  let rules = {
    param: {
      requiredNotIf: ['name', 'lushijie', 'tom']
    }
  }
  let ctx = {
    name: 'lily'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWith', t => {
  let rules = {
    param: {
      requiredWith: ['name', 'email']
    }
  }
  let ctx = {
    name: 'lily'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWithAll', t => {
  let rules = {
    param: {
      requiredWithAll: ['name', 'email']
    }
  }
  let ctx = {
    name: 'lily',
    email: 'lushijie@126.com'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWithOut', t => {
  let rules = {
    param: {
      requiredWithOut: ['name', 'email']
    }
  }
  let ctx = {
    name: 'lily'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWithOutAll', t => {
  let rules = {
    param: {
      requiredWithOutAll: ['name', 'email']
    }
  }
  let instance = new Validator({});
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-contains', t => {
  let rules = {
    param: {
      contains: 'xxx'
    }
  }
  let ctx = {
    param: 'lushijie'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-equals', t => {
  let rules = {
    param: {
      equals: 'xxx'
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-equals-ctx', t => {
  let rules = {
    param: {
      equals: 'abc'
    }
  }
  let ctx = {
    param: 'lushijie',
    abc: 'xiaoming'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-different', t => {
  let rules = {
    param: {
      different: 'lushijie'
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-before', t => {
  let rules = {
    param: {
      before: true
    }
  }
  let ctx = {
    param: '2099-12-12',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-before-date', t => {
  let rules = {
    param: {
      before: '2011-12-12'
    }
  }
  let ctx = {
    param: '2099-12-12',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-after', t => {
  let rules = {
    param: {
      after: true
    }
  }
  let ctx = {
    param: '1990-12-12',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-after-date', t => {
  let rules = {
    param: {
      after: '2099-12-12'
    }
  }
  let ctx = {
    param: '1990-12-12',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alpha', t => {
  let rules = {
    param: {
      alpha: true
    }
  }
  let ctx = {
    param: '123A',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alpha-locale', t => {
  let rules = {
    param: {
      alpha: 'en-US'
    }
  }
  let ctx = {
    param: '123A',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaDash', t => {
  let rules = {
    param: {
      alphaDash: true
    }
  }
  let ctx = {
    param: '123A',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaDash-locale', t => {
  let rules = {
    param: {
      alphaDash: 'en-US'
    }
  }
  let ctx = {
    param: '123A',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaNumeric', t => {
  let rules = {
    param: {
      alphaNumeric: true
    }
  }
  let ctx = {
    param: '123A@',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaNumeric-locale', t => {
  let rules = {
    param: {
      alphaNumeric: 'en-US'
    }
  }
  let ctx = {
    param: '123A@',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaNumericDash', t => {
  let rules = {
    param: {
      alphaNumericDash: true
    }
  }
  let ctx = {
    param: '123A@',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaNumericDash-locale', t => {
  let rules = {
    param: {
      alphaNumericDash: 'en-US'
    }
  }
  let ctx = {
    param: '123A@',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-ascii', t => {
  let rules = {
    param: {
      ascii: true
    }
  }
  let ctx = {
    param: '123A中国',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-base64', t => {
  let rules = {
    param: {
      base64: true
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-byteLength', t => {
  let rules = {
    param: {
      byteLength: {min: 0, max: 4}
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-byteLength-max-only', t => {
  let rules = {
    param: {
      byteLength: {max: 4}
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-byteLength', t => {
  let rules = {
    param: {
      byteLength: {min: 0, max: 3}
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-creditCard', t => {
  let rules = {
    param: {
      creditCard: true
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-currency', t => {
  let rules = {
    param: {
      currency: true
    }
  }
  let ctx = {
    param: 'abc',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-currency-options', t => {
  let rules = {
    param: {
      currency: {symbol: '$'}
    }
  }
  let ctx = {
    param: '￥123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-date', t => {
  let rules = {
    param: {
      date: true
    }
  }
  let ctx = {
    param: '2011-13-01',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-date-true', t => {
  let rules = {
    param: {
      date: true
    }
  }
  let ctx = {
    param: '2011-12-01',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-decimal', t => {
  let rules = {
    param: {
      decimal: true
    }
  }
  let ctx = {
    param: 'abc',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-divisibleBy', t => {
  let rules = {
    param: {
      divisibleBy: 4
    }
  }
  let ctx = {
    param: '123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-email', t => {
  let rules = {
    param: {
      email: true
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-email-options', t => {
  let rules = {
    param: {
      email: {'require_display_name': false}
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-fqdn', t => {
  let rules = {
    param: {
      fqdn: true
    }
  }
  let ctx = {
    param: 'www',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-fqdn-options', t => {
  let rules = {
    param: {
      fqdn: {require_tld: true}
    }
  }
  let ctx = {
    param: 'www',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-float', t => {
  let rules = {
    param: {
      float: true
    }
  }
  let ctx = {
    param: 'www',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-float-options', t => {
  let rules = {
    param: {
      float: {min:0, max:9.55}
    }
  }
  let ctx = {
    param: '12.00',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-fullWidth', t => {
  let rules = {
    param: {
      fullWidth: true
    }
  }
  let ctx = {
    param: 'www',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-halfWidth', t => {
  let rules = {
    param: {
      halfWidth: true
    }
  }
  let ctx = {
    param: '中国',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-hexColor', t => {
  let rules = {
    param: {
      hexColor: true
    }
  }
  let ctx = {
    param: '3444',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-hex', t => {
  let rules = {
    param: {
      hex: true
    }
  }
  let ctx = {
    param: '-12',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-ip', t => {
  let rules = {
    param: {
      ip: true
    }
  }
  let ctx = {
    param: '127.0.0.256',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-ip4', t => {
  let rules = {
    param: {
      ip4: true
    }
  }
  let ctx = {
    param: '2031:0000:1F1F:0000:0000:0100:11A0:ADD',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-ip6', t => {
  let rules = {
    param: {
      ip6: true
    }
  }
  let ctx = {
    param: '127.0.0.1',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-isbn', t => {
  let rules = {
    param: {
      isbn: true
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-isin', t => {
  let rules = {
    param: {
      isin: true
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-iso8601', t => {
  let rules = {
    param: {
      iso8601: true
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-in', t => {
  let rules = {
    param: {
      in: ['lushijie','1234560']
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-notIn', t => {
  let rules = {
    param: {
      notIn: ['lushijie','123456']
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-int', t => {
  let rules = {
    param: {
      int: true
    }
  }
  let ctx = {
    param: '123.456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-int-options', t => {
  let rules = {
    param: {
      int: {min: 0, max: 10}
    }
  }
  let ctx = {
    param: '12346',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-length-options', t => {
  let rules = {
    param: {
      length: {min: 0, max: 4}
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-length-max-only', t => {
  let rules = {
    param: {
      length: {max: 3}
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-length-min-only', t => {
  let rules = {
    param: {
      length: {min: 10}
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-lowercase', t => {
  let rules = {
    param: {
      lowercase: true
    }
  }
  let ctx = {
    param: 'Abc',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-uppercase', t => {
  let rules = {
    param: {
      uppercase: true
    }
  }
  let ctx = {
    param: 'Abc',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-mobile', t => {
  let rules = {
    param: {
      mobile: true
    }
  }
  let ctx = {
    param: '1326920XXXX',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-mobile-locale', t => {
  let rules = {
    param: {
      mobile: 'zh-CN'
    }
  }
  let ctx = {
    param: '1326920888X',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-mongoId', t => {
  let rules = {
    param: {
      mongoId: true
    }
  }
  let ctx = {
    param: '1326920',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-multibyte', t => {
  let rules = {
    param: {
      multibyte: true
    }
  }
  let ctx = {
    param: 'ABC',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-url', t => {
  let rules = {
    param: {
      url: true
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-url-options', t => {
  let rules = {
    param: {
      url: {protocols: ['http','https','ftp']}
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-order', t => {
  let rules = {
    param: {
      order: true
    }
  }
  let ctx = {
    param: 'name not DESC',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-field', t => {
  let rules = {
    param: {
      field: true
    }
  }
  let ctx = {
    param: 'name and title',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-image', t => {
  let rules = {
    param: {
      image: true
    }
  }
  let ctx = {
    param: 'a.js',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-image-options', t => {
  let rules = {
    param: {
      image: true
    }
  }
  let ctx = {
    param: {originalFilename: 'a.js'},
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-startWith', t => {
  let rules = {
    param: {
      startWith: 'shijie'
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-endWith', t => {
  let rules = {
    param: {
      endWith: 'lu'
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-issn', t => {
  let rules = {
    param: {
      issn: true
    }
  }
  let ctx = {
    param: '123123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-issn-options', t => {
  let rules = {
    param: {
      issn: {case_sensitive: false}
    }
  }
  let ctx = {
    param: '123123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-uuid', t => {
  let rules = {
    param: {
      uuid: true
    }
  }
  let ctx = {
    param: '123123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-md5', t => {
  let rules = {
    param: {
      md5: true
    }
  }
  let ctx = {
    param: '123123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-macAddress', t => {
  let rules = {
    param: {
      macAddress: true
    }
  }
  let ctx = {
    param: '123123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-numeric', t => {
  let rules = {
    param: {
      numeric: true
    }
  }
  let ctx = {
    param: 'abc',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-dataURI', t => {
  let rules = {
    param: {
      dataURI: true
    }
  }
  let ctx = {
    param: 'abc',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-regexp', t => {
  let rules = {
    param: {
      regexp: /lushijie2/g
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  //t.true(Object.keys(ret).length > 0);
});


test('rule-variableWidth', t => {
  let rules = {
    param: {
      variableWidth: true
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

// auto convert
test('rule-boolean', t => {
  let rules = {
    param: {
      boolean: true
    }
  }
  let ctx = {
    param: '123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-string', t => {
  let rules = {
    param: {
      string: true
    }
  }
  let ctx = {
    param: 123,
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

// auto convert
test('rule-array', t => {
  let rules = {
    param: {
      array: true
    }
  }
  let ctx = {
    param: '123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});


test('rule-object', t => {
  let rules = {
    param: {
      object: true
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});








test('rule-no-exist', t => {
  let rules = {
    param: {
      notExist: true
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  try{
    let ret = instance.validate(rules);
  }catch(e) {
    t.pass();
  }
});

test('rule-array-nest', t => {
  let rules = {
    param: {
      array: true,
      children: {
        int: true,
        trim: true
      }
    }
  }
  let ctx = {
    param: ['12   ', 34, 56],
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0 && ctx.param[0] === 12)
});

test('rule-object-nest', t => {
  let rules = {
    param: {
      object: true,
      children: {
        int: true,
        trim: true
      }
    }
  }
  let ctx = {
    param: {
      a: '123  '
    },
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0 && ctx.param.a === 123)
});


test('rule-ip-default', t => {
  let rules = {
    param: {
      ip: true,
      default: '127.0.0.1',
    }
  }
  let instance = new Validator({});
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ip-no-required', t => {
  let rules = {
    param: {
      ip: true,
      required: false
    }
  }
  let instance = new Validator({});
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-int-convert', t => {
  let rules = {
    param: {
      int: true,
      trim: true
    }
  }
  let ctx = {
    param: '123 ',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0 && ctx.param === 123);
});


test('rule-name-custom-message', t => {
  let rules = {
    param: {
      required: true
    },
    param2: {
      required: true
    },
    param3: {
      object: true,
      children: {
        int: true
      }
    }
  }
  let ctx = {
    param3: {
      a: 'aaa',
      b: 'abc',
      c: 'vvv',
      d: 'abc'
    }
  }

  let msgs = {
    required: 'must required',
    param: 'param must required',
    param2: {
      required: 'param2 must required'
    },
    param3: {
      'a,b': 'wrong',
      c: 'wrong c',
      d: {
        int: 'this wrong d'
      }
    }
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules, msgs);
  t.true(
    ret.param === msgs.param &&
    ret.param2 === msgs.param2.required &&
    ret.param3_object_a === msgs.param3['a,b'] &&
    ret.param3_object_c === msgs.param3.c &&
    ret.param3_object_d === msgs.param3.d.int
  );
});

test('rule-object-message', t => {
  let rules = {
    param3: {
      object: true,
      children: {
        int: true
      }
    }
  }
  let ctx = {
    param3: {
      a: 'aaa'
    }
  }

  let msgs = {
    param3: ''
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules, msgs);
  t.true(ret.param3_object_a === 'param3 valid failed');
});

test('rule-name-no-message', t => {
  let rules = {
    param: {
      required: true
    }
  }

  let msgs = {
    required: ''
  }

  let instance = new Validator({});
  let ret = instance.validate(rules, msgs);
  t.true(ret.param === 'param valid failed');
});

test('rule-add-method', t => {
  let rules = {
    param: {
      default: 'abc',
      eqlushijie: true
    }
  }
  let wrongMsg = 'eqlushijie valid failed';

  let instance = new Validator({});
  instance.add('eqlushijie', function(value, options) {
    return value === 'lushijie';
  }, wrongMsg);
  let ret = instance.validate(rules);
  t.true(ret.param === wrongMsg)
});






