/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-05-13 11:42:14
*/
import test from 'ava';
import helper from 'think-helper';
import Validator from '../index.js';

// required case
test('rule-required required', t => {
  let rules = {
    param: {
      required: true
    }
  }
  let instance = new Validator({});
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-required not required', t => {
  let rules = {
    param: {
      required: false
    }
  }
  let instance = new Validator({});
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredIf required', t => {
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

test('rule-requiredIf not required', t => {
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

test('rule-requiredIf without ctx required', t => {
  let rules = {
    param: {
      requiredIf: ['lushijie', '', 'tom']
    }
  }
  let instance = new Validator({});
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});


test('rule-requiredNotIf required', t => {
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

test('rule-requiredNotIf not required', t => {
  let rules = {
    param: {
      requiredNotIf: ['name', 'lushijie', 'tom']
    }
  }
  let ctx = {
    name: 'lushijie'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredWith required', t => {
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

test('rule-requiredWith not required', t => {
  let rules = {
    param: {
      requiredWith: ['name', 'email']
    }
  }
  let instance = new Validator({});
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});


test('rule-requiredWithAll required', t => {
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

test('rule-requiredWithAll not required', t => {
  let rules = {
    param: {
      requiredWithAll: ['name', 'email']
    }
  }
  let ctx = {
    email: 'lushijie@126.com'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredWithOut required', t => {
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

test('rule-requiredWithOut not required', t => {
  let rules = {
    param: {
      requiredWithOut: ['name', 'email']
    }
  }
  let ctx = {
    name: 'lily',
    email: 'lushijie@126.com'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredWithOutAll required', t => {
  let rules = {
    param: {
      requiredWithOutAll: ['name', 'email']
    }
  }
  let instance = new Validator({});
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWithOutAll not required', t => {
  let rules = {
    param: {
      requiredWithOutAll: ['name', 'email']
    }
  }
  let ctx = {
    name: 'lily',
    email: 'lushijie@126.com'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

// rules case
test('rule-contains failure', t => {
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

test('rule-contains success', t => {
  let rules = {
    param: {
      contains: 'xxx'
    }
  }
  let ctx = {
    param: 'sssxxxdd'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-contains parse failure', t => {
  let rules = {
    param: {
      contains: 'abc'
    }
  }
  let ctx = {
    param: 'lushijie',
    abc: '6666'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-contains parse success', t => {
  let rules = {
    param: {
      contains: 'abc'
    }
  }
  let ctx = {
    param: 'lushijie',
    abc: 'shi'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-equals failure', t => {
  let rules = {
    param: {
      equals: 'xxx'
    }
  }
  let ctx = {
    param: 'lushijie'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-equals success', t => {
  let rules = {
    param: {
      equals: 'lushijie'
    }
  }
  let ctx = {
    param: 'lushijie'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-equals parse failure', t => {
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

test('rule-equals parse success', t => {
  let rules = {
    param: {
      equals: 'abc'
    }
  }
  let ctx = {
    param: 'lushijie',
    abc: 'lushijie'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-different failure', t => {
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

test('rule-different success', t => {
  let rules = {
    param: {
      different: 'lushijie'
    }
  }
  let ctx = {
    param: 'shijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-before failure', t => {
  let rules = {
    param: {
      before: true
    }
  }
  let ctx = {
    param: '2099-12-12 12:00:00',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-before success', t => {
  let rules = {
    param: {
      before: true
    }
  }
  let ctx = {
    param: '2001-12-12 12:00:00',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-before date argument failure', t => {
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

test('rule-before date argument success', t => {
  let rules = {
    param: {
      before: '2011-12-12'
    }
  }
  let ctx = {
    param: '2000-12-12',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-after failure', t => {
  let rules = {
    param: {
      after: true
    }
  }
  let ctx = {
    param: '1990-12-12 12:00:00'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-after success', t => {
  let rules = {
    param: {
      after: true
    }
  }
  let ctx = {
    param: '2099-12-12 01:00:00'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-after date argument failure', t => {
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

test('rule-after date argument success', t => {
  let rules = {
    param: {
      after: '1970-12-12'
    }
  }
  let ctx = {
    param: '1990-12-12',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-alpha failure', t => {
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

test('rule-alpha success', t => {
  let rules = {
    param: {
      alpha: true
    }
  }
  let ctx = {
    param: 'abcABC',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});


test('rule-alphaDash failure', t => {
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

test('rule-alphaDash success', t => {
  let rules = {
    param: {
      alphaDash: true
    }
  }
  let ctx = {
    param: 'Ab_',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-alphaNumeric failure', t => {
  let rules = {
    param: {
      alphaNumeric: true
    }
  }
  let ctx = {
    param: '123Ad_',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaNumeric success', t => {
  let rules = {
    param: {
      alphaNumeric: true
    }
  }
  let ctx = {
    param: '123ABCabc',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-alphaNumericDash failure', t => {
  let rules = {
    param: {
      alphaNumericDash: true
    }
  }
  let ctx = {
    param: '123A@_sdfF',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaNumericDash success', t => {
  let rules = {
    param: {
      alphaNumericDash: true
    }
  }
  let ctx = {
    param: 'aA1sdf_ASDF',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ascii failure', t => {
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

test('rule-ascii failure', t => {
  let rules = {
    param: {
      ascii: true
    }
  }
  let ctx = {
    param: 'welefNn￥wer_we1$212',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-ascii success', t => {
  let rules = {
    param: {
      ascii: true
    }
  }
  let ctx = {
    param: 'welefNnwer_we1$212',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-base64 failure', t => {
  let rules = {
    param: {
      base64: true
    }
  }
  let ctx = {
    param: (new Buffer('fasdfasdfw23$$$')).toString('utf8'),
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-base64 success', t => {
  let rules = {
    param: {
      base64: true
    }
  }
  let ctx = {
    param: (new Buffer('welefen')).toString('base64'),
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-byteLength failure', t => {
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

test('rule-byteLength success', t => {
  let rules = {
    param: {
      byteLength: {min: 0, max: 10}
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
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

test('rule-creditCard failure', t => {
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

test('rule-creditCard success', t => {
  let rules = {
    param: {
      creditCard: true
    }
  }
  let ctx = {
    param: '378260516568353',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-currency failure', t => {
  let rules = {
    param: {
      currency: true
    }
  }
  let ctx = {
    param: '￥123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-currency success', t => {
  let rules = {
    param: {
      currency: true
    }
  }
  let ctx = {
    param: '$123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-currency options success', t => {
  let rules = {
    param: {
      currency: {symbol: '￥'}
    }
  }
  let ctx = {
    param: '￥123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-date failure', t => {
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

test('rule-date success', t => {
  let rules = {
    param: {
      date: true
    }
  }
  let ctx = {
    param: '2011-11-01 12:00:32',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-decimal failure', t => {
  let rules = {
    param: {
      decimal: true
    }
  }
  let ctx = {
    param: 'x',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-decimal success1', t => {
  let rules = {
    param: {
      decimal: true
    }
  }
  let ctx = {
    param: '.1',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-decimal success2', t => {
  let rules = {
    param: {
      decimal: true
    }
  }
  let ctx = {
    param: '0.01',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-divisibleBy failure', t => {
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

test('rule-divisibleBy success', t => {
  let rules = {
    param: {
      divisibleBy: 2
    }
  }
  let ctx = {
    param: '10',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-email failure', t => {
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

test('rule-email success', t => {
  let rules = {
    param: {
      email: true
    }
  }
  let ctx = {
    param: 'lushijie@126.com',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-email options success', t => {
  let rules = {
    param: {
      email: { allow_utf8_local_part: false }
    }
  }
  let ctx = {
    param: '"foo\\@bar"@example.com',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fqdn failure', t => {
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

test('rule-fqdn success1', t => {
  let rules = {
    param: {
      fqdn: true
    }
  }
  let ctx = {
    param: 'gmail.com',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fqdn success2', t => {
  let rules = {
    param: {
      fqdn: true
    }
  }
  let ctx = {
    param: 'www.gmail.com',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fqdn success3', t => {
  let rules = {
    param: {
      fqdn: true
    }
  }
  let ctx = {
    param: 'ww-w.gmail.com',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fqdn options success', t => {
  let rules = {
    param: {
      fqdn: { allow_trailing_dot: true }
    }
  }
  let ctx = {
    param: 'example.com.',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-float failure', t => {
  let rules = {
    param: {
      float: true
    }
  }
  let ctx = {
    param: 'abc',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-float success1', t => {
  let rules = {
    param: {
      float: true
    }
  }
  let ctx = {
    param: '12.45',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-float success2', t => {
  let rules = {
    param: {
      float: true
    }
  }
  let ctx = {
    param: '125',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-float success3', t => {
  let rules = {
    param: {
      float: true
    }
  }
  let ctx = {
    param: NaN,
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-float options failure', t => {
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

test('rule-float options success', t => {
  let rules = {
    param: {
      float: {min:0, max:9.55}
    }
  }
  let ctx = {
    param: '8.00',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fullWidth failure', t => {
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

test('rule-fullWidth success1', t => {
  let rules = {
    param: {
      fullWidth: true
    }
  }
  let ctx = {
    param: '￥',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fullWidth success2', t => {
  let rules = {
    param: {
      fullWidth: true
    }
  }
  let ctx = {
    param: '￥$$$',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fullWidth success3', t => {
  let rules = {
    param: {
      fullWidth: true
    }
  }
  let ctx = {
    param: '￥$$',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
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

test('rule-hexColor failure', t => {
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

test('rule-hexColor success1', t => {
  let rules = {
    param: {
      hexColor: true
    }
  }
  let ctx = {
    param: '#fff',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-hexColor success2', t => {
  let rules = {
    param: {
      hexColor: true
    }
  }
  let ctx = {
    param: '#998323',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-hex success', t => {
  let rules = {
    param: {
      hex: true
    }
  }
  let ctx = {
    param: 'a0a',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ip failure', t => {
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

test('rule-ip success1', t => {
  let rules = {
    param: {
      ip: true
    }
  }
  let ctx = {
    param: '127.0.0.255',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ip success2', t => {
  let rules = {
    param: {
      ip: true
    }
  }
  let ctx = {
    param: '2031:0000:1F1F:0000:0000:0100:11A0:ADD',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ip4 failure', t => {
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

test('rule-ip4 success', t => {
  let rules = {
    param: {
      ip4: true
    }
  }
  let ctx = {
    param: '127.0.0.1',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ip6 failure', t => {
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

test('rule-ip6 success', t => {
  let rules = {
    param: {
      ip6: true
    }
  }
  let ctx = {
    param: '2031:0000:1F1F:0000:0000:0100:11A0:ADD',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-isbn failure', t => {
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

test('rule-isbn success', t => {
  let rules = {
    param: {
      isbn: true
    }
  }
  let ctx = {
    param: '9787540471644',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-isin failure', t => {
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

test('rule-isin success', t => {
  let rules = {
    param: {
      isin: true
    }
  }
  let ctx = {
    param: 'DE000BAY0017',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-iso8601 failure', t => {
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

test('rule-iso8601 success', t => {
  let rules = {
    param: {
      iso8601: true
    }
  }
  let ctx = {
    param: '2011-02-11',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-in failure', t => {
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

test('rule-in success', t => {
  let rules = {
    param: {
      in: ['lushijie','1234560']
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-notIn failure', t => {
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

test('rule-notIn success', t => {
  let rules = {
    param: {
      notIn: ['lushijie','123456']
    }
  }
  let ctx = {
    param: 'avc',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-int failure', t => {
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

test('rule-int success', t => {
  let rules = {
    param: {
      int: true
    }
  }
  let ctx = {
    param: '12456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-int options failure', t => {
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

test('rule-int options success', t => {
  let rules = {
    param: {
      int: {min: 0, max: 10}
    }
  }
  let ctx = {
    param: '6',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-length options failure', t => {
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

test('rule-length options success', t => {
  let rules = {
    param: {
      length: {min: 0, max: 10}
    }
  }
  let ctx = {
    param: '123456',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
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

test('rule-uppercase failure', t => {
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

test('rule-uppercase success', t => {
  let rules = {
    param: {
      uppercase: true
    }
  }
  let ctx = {
    param: '$$$$$￥',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});


test('rule-mobile failure', t => {
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

test('rule-mobile success', t => {
  let rules = {
    param: {
      mobile: true
    }
  }
  let ctx = {
    param: '13269207867',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
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

test('rule-multibyte failure', t => {
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

test('rule-multibyte success', t => {
  let rules = {
    param: {
      multibyte: true
    }
  }
  let ctx = {
    param: '$$$$$￥',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-url failure', t => {
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

test('rule-url success2', t => {
  let rules = {
    param: {
      url: true
    }
  }
  let ctx = {
    param: 'https://github.com/lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-url success2', t => {
  let rules = {
    param: {
      url: true
    }
  }
  let ctx = {
    param: '',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-url options success', t => {
  let rules = {
    param: {
      url: {protocols: ['http','https','ftp']}
    }
  }
  let ctx = {
    param: 'https://github.com/lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-order failure', t => {
  let rules = {
    param: {
      order: true
    }
  }
  let ctx = {
    param: 'name|DESC',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-order success1', t => {
  let rules = {
    param: {
      order: true
    }
  }
  let ctx = {
    param: 'name ASC, id DESC',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-order success2', t => {
  let rules = {
    param: {
      order: true
    }
  }
  let ctx = {
    param: '',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-field success1', t => {
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

test('rule-field success2', t => {
  let rules = {
    param: {
      field: true
    }
  }
  let ctx = {
    param: '',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-field success3', t => {
  let rules = {
    param: {
      field: true
    }
  }
  let ctx = {
    param: '*',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-field success4', t => {
  let rules = {
    param: {
      field: true
    }
  }
  let ctx = {
    param: 'name, *',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
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

test('rule-startWith failure', t => {
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

test('rule-startWith success', t => {
  let rules = {
    param: {
      startWith: 'shijie'
    }
  }
  let ctx = {
    param: 'shijiesdf',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-endWith failure', t => {
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

test('rule-endWith success', t => {
  let rules = {
    param: {
      endWith: 'jie'
    }
  }
  let ctx = {
    param: 'lushijie',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-issn failure', t => {
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

test('rule-issn success', t => {
  let rules = {
    param: {
      issn: true
    }
  }
  let ctx = {
    param: '2434-561X',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
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


test('rule-uuid failure', t => {
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

test('rule-uuid success', t => {
  let rules = {
    param: {
      uuid: true
    }
  }
  let ctx = {
    param: 'A987FBC9-4BED-3078-CF07-9141BA07C9F3',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-md5 failure', t => {
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

test('rule-md5 success', t => {
  let rules = {
    param: {
      md5: true
    }
  }
  let ctx = {
    param: 'd94f3f016ae679c3008de268209132f2',  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-macAddress failure', t => {
  let rules = {
    param: {
      macAddress: true
    }
  }
  let ctx = {
    param: '1:2:3:4:5:6',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-macAddress success', t => {
  let rules = {
    param: {
      macAddress: true
    }
  }
  let ctx = {
    param: '01:02:03:04:05:ab',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-numeric failure', t => {
  let rules = {
    param: {
      numeric: true
    }
  }
  let ctx = {
    param: '1.123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-numeric success', t => {
  let rules = {
    param: {
      numeric: true
    }
  }
  let ctx = {
    param: '123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-dataURI failure', t => {
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

test('rule-dataURI success', t => {
  let rules = {
    param: {
      dataURI: true
    }
  }
  let ctx = {
    param: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
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
  t.true(Object.keys(ret).length > 0);
});


test('rule-variableWidth failure', t => {
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

test('rule-variableWidth success', t => {
  let rules = {
    param: {
      variableWidth: true
    }
  }
  let ctx = {
    param: '$$$$$￥w',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
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

test('rule-string failure', t => {
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

test('rule-string success', t => {
  let rules = {
    param: {
      string: true
    }
  }
  let ctx = {
    param: '123',
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
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


test('rule-object failure', t => {
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

test('rule-object success', t => {
  let rules = {
    param: {
      object: true
    }
  }
  let ctx = {
    param: {a: 123},
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
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
  t.true(Object.keys(ret).length === 0 && ctx['param'][0] === 12)
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
  t.true(Object.keys(ret).length === 0 && ctx['param'].a === 123)
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
      'a,b': 'this is wrong for a,b',
      c: 'this is wrong for c',
      d: {
        int: 'this wrong for d'
      }
    }
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules, msgs);
  t.true(
    ret.param === msgs.param &&
    ret.param2 === msgs.param2.required &&
    ret['param3.a'] === msgs.param3['a,b'] &&
    ret['param3.c'] === msgs.param3.c &&
    ret['param3.d'] === msgs.param3.d.int
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
  t.true(ret['param3.a'] === 'param3 valid failed');
});

test('rule-array-message', t => {
  let rules = {
    param3: {
      array: true,
      children: {
        int: true
      }
    }
  }
  let ctx = {
    param3: ['1a']
  }
  let msgs = {
    int: 'wrong valid'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules, msgs);
  t.true(ret['param3[0]'] === msgs.int);
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

  let instance = new Validator();
  instance.add('eqlushijie', function(value, options) {
    return value === 'lushijie';
  }, wrongMsg);
  let ret = instance.validate(rules);
  t.true(ret.param === wrongMsg)
});

test('rule one-more-basic type', t => {
  let rules = {
    param: {
      int: true,
      float: true
    }
  }
  let instance = new Validator({});
  try {
    let ret = instance.validate(rules);
  }catch(e) {
    t.pass();
  }
});
