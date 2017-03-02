/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-02 18:43:12
*/
import test from 'ava';
import thinkHelper from 'think-helper';
import thinkValidate from '../index.js';

test('rule-required', t => {
  let rules = {
    param: {
      required: true
    }
  }
  let ret = thinkValidate(rules, {});
  t.true(ret._valid === false);
});

test('rule-requiredIf', t => {
  let rules = {
    param: {
      requiredIf: ['name', 'lushijie', 'tom']
    }
  }
  let requestData = {
    name: 'lushijie'
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-requiredIf-noParam', t => {
  let rules = {
    param: {
      requiredIf: ['lushijie', '', 'tom']
    }
  }
  let ret = thinkValidate(rules, {});
  t.true(ret._valid === false);
});


test('rule-requiredNotIf', t => {
  let rules = {
    param: {
      requiredNotIf: ['name', 'lushijie', 'tom']
    }
  }
  let requestData = {
    name: 'lily'
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-requiredWith', t => {
  let rules = {
    param: {
      requiredWith: ['name', 'email']
    }
  }
  let requestData = {
    name: 'lily'
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-requiredWithAll', t => {
  let rules = {
    param: {
      requiredWithAll: ['name', 'email']
    }
  }
  let requestData = {
    name: 'lily',
    email: 'lushijie@126.com'
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-requiredWithOut', t => {
  let rules = {
    param: {
      requiredWithOut: ['name', 'email']
    }
  }
  let requestData = {
    name: 'lily'
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-requiredWithOutAll', t => {
  let rules = {
    param: {
      requiredWithOutAll: ['name', 'email']
    }
  }
  let ret = thinkValidate(rules, {});
  t.true(ret._valid === false);
});


test('rule-contains', t => {
  let rules = {
    param: {
      contains: 'xxx'
    }
  }
  let requestData = {
    param: 'lushijie'
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-equals', t => {
  let rules = {
    param: {
      equals: 'xxx'
    }
  }
  let requestData = {
    param: 'lushijie',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-equals-item', t => {
  let rules = {
    param: {
      equals: 'abc'
    }
  }
  let requestData = {
    param: 'lushijie',
    abc: 'xiaoming'
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-different', t => {
  let rules = {
    param: {
      different: 'lushijie'
    }
  }
  let requestData = {
    param: 'lushijie',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-before', t => {
  let rules = {
    param: {
      before: true
    }
  }
  let requestData = {
    param: '2099-12-12',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-before-date', t => {
  let rules = {
    param: {
      before: '2011-12-12'
    }
  }
  let requestData = {
    param: '2099-12-12',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-after', t => {
  let rules = {
    param: {
      after: true
    }
  }
  let requestData = {
    param: '1990-12-12',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-after-date', t => {
  let rules = {
    param: {
      after: '2099-12-12'
    }
  }
  let requestData = {
    param: '1990-12-12',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-alpha', t => {
  let rules = {
    param: {
      alpha: true
    }
  }
  let requestData = {
    param: '123A',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-alpha-locale', t => {
  let rules = {
    param: {
      alpha: 'en-US'
    }
  }
  let requestData = {
    param: '123A',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-alphaDash', t => {
  let rules = {
    param: {
      alphaDash: true
    }
  }
  let requestData = {
    param: '123A',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-alphaDash-locale', t => {
  let rules = {
    param: {
      alphaDash: 'en-US'
    }
  }
  let requestData = {
    param: '123A',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-alphaNumeric', t => {
  let rules = {
    param: {
      alphaNumeric: true
    }
  }
  let requestData = {
    param: '123A@',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-alphaNumeric-locale', t => {
  let rules = {
    param: {
      alphaNumeric: 'en-US'
    }
  }
  let requestData = {
    param: '123A@',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-alphaNumericDash', t => {
  let rules = {
    param: {
      alphaNumericDash: true
    }
  }
  let requestData = {
    param: '123A@',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-alphaNumericDash-locale', t => {
  let rules = {
    param: {
      alphaNumericDash: 'en-US'
    }
  }
  let requestData = {
    param: '123A@',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-ascii', t => {
  let rules = {
    param: {
      ascii: true
    }
  }
  let requestData = {
    param: '123A中国',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-base64', t => {
  let rules = {
    param: {
      base64: true
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-byteLength-default', t => {
  let rules = {
    param: {
      byteLength: true
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret.param === '123456');
});

test('rule-byteLength', t => {
  let rules = {
    param: {
      byteLength: {min: 0, max: 3}
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-creditCard', t => {
  let rules = {
    param: {
      creditCard: true
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-currency', t => {
  let rules = {
    param: {
      currency: true
    }
  }
  let requestData = {
    param: 'abc',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-currency-options', t => {
  let rules = {
    param: {
      currency: {symbol: '$'}
    }
  }
  let requestData = {
    param: '￥123',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-date', t => {
  let rules = {
    param: {
      date: true
    }
  }
  let requestData = {
    param: '2011-13-01',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-date-true', t => {
  let rules = {
    param: {
      date: true
    }
  }
  let requestData = {
    param: '2011-12-01',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret.param === '2011-12-01');
});

test('rule-decimal', t => {
  let rules = {
    param: {
      decimal: true
    }
  }
  let requestData = {
    param: 'abc',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-divisibleBy', t => {
  let rules = {
    param: {
      divisibleBy: 4
    }
  }
  let requestData = {
    param: '123',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-email', t => {
  let rules = {
    param: {
      email: true
    }
  }
  let requestData = {
    param: 'lushijie',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-email-options', t => {
  let rules = {
    param: {
      email: {'require_display_name': false}
    }
  }
  let requestData = {
    param: 'lushijie',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-fqdn', t => {
  let rules = {
    param: {
      fqdn: true
    }
  }
  let requestData = {
    param: 'www',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-fqdn-options', t => {
  let rules = {
    param: {
      fqdn: {require_tld: true}
    }
  }
  let requestData = {
    param: 'www',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-float', t => {
  let rules = {
    param: {
      float: true
    }
  }
  let requestData = {
    param: 'www',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-float-options', t => {
  let rules = {
    param: {
      float: {min:0, max:9.55}
    }
  }
  let requestData = {
    param: '12.00',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-fullWidth', t => {
  let rules = {
    param: {
      fullWidth: true
    }
  }
  let requestData = {
    param: 'www',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-halfWidth', t => {
  let rules = {
    param: {
      halfWidth: true
    }
  }
  let requestData = {
    param: '中国',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-hexColor', t => {
  let rules = {
    param: {
      hexColor: true
    }
  }
  let requestData = {
    param: '3444',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-hex', t => {
  let rules = {
    param: {
      hex: true
    }
  }
  let requestData = {
    param: '-12',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-ip', t => {
  let rules = {
    param: {
      ip: true
    }
  }
  let requestData = {
    param: '127.0.0.256',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-ip4', t => {
  let rules = {
    param: {
      ip4: true
    }
  }
  let requestData = {
    param: '2031:0000:1F1F:0000:0000:0100:11A0:ADD',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-ip6', t => {
  let rules = {
    param: {
      ip6: true
    }
  }
  let requestData = {
    param: '127.0.0.1',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-isbn', t => {
  let rules = {
    param: {
      isbn: true
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-isin', t => {
  let rules = {
    param: {
      isin: true
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-iso8601', t => {
  let rules = {
    param: {
      iso8601: true
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-in', t => {
  let rules = {
    param: {
      in: ['lushijie','1234560']
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-notIn', t => {
  let rules = {
    param: {
      notIn: ['lushijie','123456']
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-int-options', t => {
  let rules = {
    param: {
      int: {min: 1, max: 4}
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-int', t => {
  let rules = {
    param: {
      int: true
    }
  }
  let requestData = {
    param: '1234.56',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

// test('rule-min', t => {
//   let rules = {
//     param: {
//       minInt: 100
//     }
//   }
//   let requestData = {
//     param: '16',
//   }
//   let ret = thinkValidate(rules, requestData);
//   t.true(ret._valid === false);
// });

// test('rule-max', t => {
//   let rules = {
//     param: {
//       maxInt: 123
//     }
//   }
//   let requestData = {
//     param: '123456',
//   }
//   let ret = thinkValidate(rules, requestData);
//   t.true(ret._valid === false);
// });


test('rule-length', t => {
  let rules = {
    param: {
      length: true
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret.param === '123456');
});

test('rule-length-options', t => {
  let rules = {
    param: {
      length: {min:0, max:4}
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-minLength', t => {
  let rules = {
    param: {
      minLength: 123
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-maxLength', t => {
  let rules = {
    param: {
      maxLength: 1
    }
  }
  let requestData = {
    param: '123456',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-lowercase', t => {
  let rules = {
    param: {
      lowercase: true
    }
  }
  let requestData = {
    param: 'Abc',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-uppercase', t => {
  let rules = {
    param: {
      uppercase: true
    }
  }
  let requestData = {
    param: 'Abc',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-mobile', t => {
  let rules = {
    param: {
      mobile: true
    }
  }
  let requestData = {
    param: '1326920XXXX',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-mobile-locale', t => {
  let rules = {
    param: {
      mobile: 'zh-CN'
    }
  }
  let requestData = {
    param: '1326920888X',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-mongoId', t => {
  let rules = {
    param: {
      mongoId: true
    }
  }
  let requestData = {
    param: '1326920',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-multibyte', t => {
  let rules = {
    param: {
      multibyte: true
    }
  }
  let requestData = {
    param: 'ABC',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-url', t => {
  let rules = {
    param: {
      url: true
    }
  }
  let requestData = {
    param: 'lushijie',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-url-options', t => {
  let rules = {
    param: {
      url: {protocols: ['http','https','ftp']}
    }
  }
  let requestData = {
    param: 'lushijie',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-order', t => {
  let rules = {
    param: {
      order: true
    }
  }
  let requestData = {
    param: 'name not DESC',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-field', t => {
  let rules = {
    param: {
      field: true
    }
  }
  let requestData = {
    param: 'name and title',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-image', t => {
  let rules = {
    param: {
      image: true
    }
  }
  let requestData = {
    param: 'a.js',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-image-options', t => {
  let rules = {
    param: {
      image: true
    }
  }
  let requestData = {
    param: {originalFilename: 'a.js'},
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-startWith', t => {
  let rules = {
    param: {
      startWith: 'shijie'
    }
  }
  let requestData = {
    param: 'lushijie',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-endWith', t => {
  let rules = {
    param: {
      endWith: 'lu'
    }
  }
  let requestData = {
    param: 'lushijie',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-issn', t => {
  let rules = {
    param: {
      issn: true
    }
  }
  let requestData = {
    param: '123123',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-issn-options', t => {
  let rules = {
    param: {
      issn: {case_sensitive: false}
    }
  }
  let requestData = {
    param: '123123',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-uuid', t => {
  let rules = {
    param: {
      uuid: true
    }
  }
  let requestData = {
    param: '123123',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-md5', t => {
  let rules = {
    param: {
      md5: true
    }
  }
  let requestData = {
    param: '123123',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-macAddress', t => {
  let rules = {
    param: {
      macAddress: true
    }
  }
  let requestData = {
    param: '123123',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-numeric', t => {
  let rules = {
    param: {
      numeric: true
    }
  }
  let requestData = {
    param: 'abc',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});

test('rule-dataURI', t => {
  let rules = {
    param: {
      dataURI: true
    }
  }
  let requestData = {
    param: 'abc',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});


test('rule-regexp', t => {
  let rules = {
    param: {
      regexp: /lushijie2/g
    }
  }
  let requestData = {
    param: 'lushijie',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret._valid === false);
});








test('rule-notExist', t => {
  let rules = {
    param: {
      notExist: true
    }
  }
  let requestData = {
    param: 'lushijie',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(thinkHelper.isError(ret));
});

test('rule-ip-default-trim', t => {
  let rules = {
    param: {
      ip: true,
      default: '127.0.0.1  ',
      trim: true
    }
  }
  let ret = thinkValidate(rules);
  t.true(ret.param === '127.0.0.1');
});

test('rule-ip-required', t => {
  let rules = {
    param: {
      ip: true,
      required: false
    }
  }
  let ret = thinkValidate(rules);
  t.true(ret._valid === undefined && ret.param === undefined);
});

test('rule-int-msg', t => {
  let rules = {
    param: {
      int: true,
      errmsg: 'param must be integer'
    }
  }
  let requestData = {
    param: 'lushijie',
  }

  let ret = thinkValidate(rules, requestData);
  t.true(ret.errmsg === rules.param.errmsg);
});


test('rule-int-convert', t => {
  let rules = {
    param: {
      int: true
    }
  }
  let requestData = {
    param: '123',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret.param === 123);
});

test('rule-float-convert', t => {
  let rules = {
    param: {
      float: true
    }
  }
  let requestData = {
    param: '123.12',
  }
  let ret = thinkValidate(rules, requestData);
  t.true(ret.param === 123.12);
});







