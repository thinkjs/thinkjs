/*
* @Author: lushijie
* @Date:   2017-05-14 09:23:50
* @Last Modified by:   lushijie
* @Last Modified time: 2017-08-16 15:05:31
*/
import test from 'ava';
import helper from 'think-helper';
import Validator from '../index.js';
import defaultCtx from './ctx.js';
const NOERROR = ' valid failed';


test('rule-required, required = true', t => {
  let rules = {
    username: {
      required: true
    }
  }
  let instance = new Validator(helper.extend({}, defaultCtx));
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-required, required = false', t => {
  let rules = {
    username: {
      required: false
    }
  }
  let instance = new Validator(helper.extend({}, defaultCtx));
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredIf, if the first(parsed) in the last others then required = true', t => {
  let rules = {
    username: {
      requiredIf: ['name', 'lushijie', 'tom']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredIf, if the first(parsed) in the last others then required = true 2', t => {
  let rules = {
    username: {
      requiredIf: ['name', 'lushijie', 'tom']
    },
    name: {
      method: 'post'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredIf, if the fist(parsed) not in the last then required = false', t => {
  let rules = {
    username: {
      requiredIf: ['name', 'lushijie', 'tom']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'xiaoming'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredIf, if the first not in this.query then required = false', t => {
  let rules = {
    username: {
      requiredIf: ['lushijie', '', 'tom']
    }
  }
  let instance = new Validator(helper.extend({}, defaultCtx));
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredNotIf, if the first(parsed) not in the last then required = true', t => {
  let rules = {
    username: {
      requiredNotIf: ['name', 'lushijie', 'tom']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'xiaoming'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredNotIf, if the first(parsed) in the last then required = false', t => {
  let rules = {
    username: {
      requiredNotIf: ['name', 'lushijie', 'tom']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredWith, if more than one in this.query then required = true', t => {
  let rules = {
    username: {
      requiredWith: ['name', 'email']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWith, if more than one in this.query then required = true 2', t => {
  let rules = {
    username: {
      requiredWith: ['name', 'email']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWith, if more than one in this.query then required = true 2', t => {
  let rules = {
    username: {
      requiredWith: ['name', 'email']
    },
    name: {
      method: 'POST'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    POST: {
      name: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWith, if zero one in this.query then required = false', t => {
  let rules = {
    param: {
      requiredWith: ['name', 'email']
    }
  }
  let instance = new Validator(helper.extend({}, defaultCtx));
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredWithAll, if all in this.query then required = true', t => {
  let rules = {
    username: {
      requiredWithAll: ['name', 'email']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'lushijie',
      email: 'lushijie@126.com'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWithAll, if not all in this.query then required = false', t => {
  let rules = {
    username: {
      requiredWithAll: ['name', 'email']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      email: 'lushijie@126.com'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredWithOut, if at least one not in this.query then required = true', t => {
  let rules = {
    username: {
      requiredWithOut: ['name', 'email']
    }
  };
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWithOut, if all in this.query then required = false', t => {
  let rules = {
    username: {
      requiredWithOut: ['name', 'email']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'lily',
      email: 'lushijie@126.com'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-requiredWithOutAll, if all not in this.query then required = true', t => {
  let rules = {
    username: {
      requiredWithOutAll: ['name', 'email']
    }
  }
  let instance = new Validator(helper.extend({}, defaultCtx));
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-requiredWithOutAll, if not all in this.query then required = false', t => {
  let rules = {
    username: {
      requiredWithOutAll: ['name', 'email']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      name: 'lily'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-contains failure', t => {
  let rules = {
    username: {
      contains: 'xxx'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      username: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-contains success', t => {
  let rules = {
    username: {
      contains: 'xxx'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      username: 'lxxxd'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-equals failure', t => {
  let rules = {
    username: {
      equals: 'xxx'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      username: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-equals parse failure', t => {
  let rules = {
    username: {
      equals: 'abc'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      username: 'lushijie',
      abc: 'xiaoming'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-equals parse success', t => {
  let rules = {
    username: {
      equals: 'abc'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      username: 'lushijie',
      abc: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-equals parse success 2', t => {
  let rules = {
    username: {
      equals: 'abc'
    },
    abc: {
      method: 'POST'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      username: 'lushijie',
      abc: 'lushijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-different success', t => {
  let rules = {
    username: {
      different: 'lushijie'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      username: 'shijie'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-before failure', t => {
  let rules = {
    time: {
      before: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      time: '2099-12-12 12:00:00',
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-before success', t => {
  let rules = {
    time: {
      before: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      time: '2001-12-12 12:00:00',
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-before date argument failure', t => {
  let rules = {
    time: {
      before: '2011-12-12'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      time: '2099-12-12',
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-before date argument success', t => {
  let rules = {
    time: {
      before: '2011-12-12'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      time: '2000-12-12'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-after failure', t => {
  let rules = {
    time: {
      after: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      time: '1990-12-12 12:00:00'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-after success', t => {
  let rules = {
    time: {
      after: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      time: '2099-12-12 01:00:00'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-after date argument failure', t => {
  let rules = {
    time: {
      after: '2099-12-12'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      time: '1990-12-12'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-after date argument success', t => {
  let rules = {
    time: {
      after: '1970-12-12'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      time: '1990-12-12'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-alpha failure', t => {
  let rules = {
    arg: {
      alpha: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123A'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alpha success', t => {
  let rules = {
    arg: {
      alpha: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'abcABC'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-alphaDash failure', t => {
  let rules = {
    arg: {
      alphaDash: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123A'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaDash success', t => {
  let rules = {
    arg: {
      alphaDash: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'Ab_'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-alphaNumeric failure', t => {
  let rules = {
    arg: {
      alphaNumeric: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123Ad_'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaNumeric success', t => {
  let rules = {
    arg: {
      alphaNumeric: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123ABCabc'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-alphaNumericDash failure', t => {
  let rules = {
    arg: {
      alphaNumericDash: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123A@_sdfF'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-alphaNumericDash success', t => {
  let rules = {
    arg: {
      alphaNumericDash: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'aA1sdf_ASDF'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ascii failure', t => {
  let rules = {
    arg: {
      ascii: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123A中国'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-ascii failure', t => {
  let rules = {
    arg: {
      ascii: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'welefNn￥wer_we1$212'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-ascii success', t => {
  let rules = {
    arg: {
      ascii: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'welefNnwer_we1$212'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-base64 failure', t => {
  let rules = {
    arg: {
      base64: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: (new Buffer('fasdfasdfw23$$$')).toString('utf8'),
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-base64 success', t => {
  let rules = {
    arg: {
      base64: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: (new Buffer('welefen')).toString('base64'),
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-byteLength failure1', t => {
  let rules = {
    arg: {
      byteLength: {min: 0, max: 4}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-byteLength failure2', t => {
  let rules = {
    arg: {
      byteLength: 4
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '1234'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-byteLength failure3', t => {
  let rules = {
    arg: {
      byteLength: 4
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-byteLength success', t => {
  let rules = {
    arg: {
      byteLength: {min: 0, max: 10}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-byteLength-max-only', t => {
  let rules = {
    arg: {
      byteLength: {max: 4}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-creditCard failure', t => {
  let rules = {
    arg: {
      creditCard: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-creditCard success', t => {
  let rules = {
    arg: {
      creditCard: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '378260516568353'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-currency failure', t => {
  let rules = {
    arg: {
      currency: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '￥123'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-currency success', t => {
  let rules = {
    arg: {
      currency: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '$123'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-currency options success', t => {
  let rules = {
    arg: {
      currency: {symbol: '￥'}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '￥123'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-date failure', t => {
  let rules = {
    arg: {
      date: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '2011-13-01'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-date success', t => {
  let rules = {
    arg: {
      date: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '2011-11-01 12:00:32'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-decimal failure', t => {
  let rules = {
    arg: {
      decimal: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'x'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-decimal success1', t => {
  let rules = {
    arg: {
      decimal: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '.1'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-decimal success2', t => {
  let rules = {
    arg: {
      decimal: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '0.01'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-divisibleBy failure', t => {
  let rules = {
    arg: {
      divisibleBy: 4
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-divisibleBy success', t => {
  let rules = {
    arg: {
      divisibleBy: 2
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '10'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-email failure', t => {
  let rules = {
    arg: {
      email: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-email success', t => {
  let rules = {
    arg: {
      email: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie@126.com'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-email options success', t => {
  let rules = {
    arg: {
      email: { allow_utf8_local_part: false }
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '"foo\\@bar"@example.com'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fqdn failure', t => {
  let rules = {
    arg: {
      fqdn: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'www'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-fqdn success1', t => {
  let rules = {
    arg: {
      fqdn: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'gmail.com'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fqdn success2', t => {
  let rules = {
    arg: {
      fqdn: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'www.gmail.com'
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fqdn success3', t => {
  let rules = {
    arg: {
      fqdn: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'ww-w.gmail.com'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fqdn options success', t => {
  let rules = {
    arg: {
      fqdn: { allow_trailing_dot: true }
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'example.com.'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-float failure', t => {
  let rules = {
    arg: {
      float: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'abc'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-float success1', t => {
  let rules = {
    arg: {
      float: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '12.45'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-float success2', t => {
  let rules = {
    arg: {
      float: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '125'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-float success3', t => {
  let rules = {
    arg: {
      float: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: NaN
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-float options failure', t => {
  let rules = {
    arg: {
      float: {min:0, max:9.55}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '12.00'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-float options success', t => {
  let rules = {
    arg: {
      float: {min:0, max:9.55}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '8.00'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fullWidth failure', t => {
  let rules = {
    arg: {
      fullWidth: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'www'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-fullWidth success1', t => {
  let rules = {
    arg: {
      fullWidth: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '￥'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fullWidth success2', t => {
  let rules = {
    arg: {
      fullWidth: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '￥$$'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-fullWidth success3', t => {
  let rules = {
    arg: {
      fullWidth: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '￥$$'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-halfWidth', t => {
  let rules = {
    arg: {
      halfWidth: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '中国'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-hexColor failure', t => {
  let rules = {
    arg: {
      hexColor: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '3444'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-hexColor success1', t => {
  let rules = {
    arg: {
      hexColor: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '#fff'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-hexColor success2', t => {
  let rules = {
    arg: {
      hexColor: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '#998323'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-hex success', t => {
  let rules = {
    arg: {
      hex: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'a0a'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ip failure', t => {
  let rules = {
    arg: {
      ip: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '127.0.0.256'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-ip success1', t => {
  let rules = {
    arg: {
      ip: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '127.0.0.255'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ip success2', t => {
  let rules = {
    arg: {
      ip: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '2031:0000:1F1F:0000:0000:0100:11A0:ADD'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ip4 failure', t => {
  let rules = {
    arg: {
      ip4: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '2031:0000:1F1F:0000:0000:0100:11A0:ADD'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-ip4 success', t => {
  let rules = {
    arg: {
      ip4: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '127.0.0.1'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-ip6 failure', t => {
  let rules = {
    arg: {
      ip6: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '127.0.0.1'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-ip6 success', t => {
  let rules = {
    arg: {
      ip6: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '2031:0000:1F1F:0000:0000:0100:11A0:ADD'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-isbn failure', t => {
  let rules = {
    arg: {
      isbn: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-isbn success', t => {
  let rules = {
    arg: {
      isbn: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '9787540471644'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-isin failure', t => {
  let rules = {
    arg: {
      isin: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-isin success', t => {
  let rules = {
    arg: {
      isin: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'DE000BAY0017'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-iso8601 failure', t => {
  let rules = {
    arg: {
      iso8601: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-iso8601 success', t => {
  let rules = {
    arg: {
      iso8601: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '2011-02-11'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-in failure', t => {
  let rules = {
    arg: {
      in: ['lushijie','1234560']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-in success', t => {
  let rules = {
    arg: {
      in: ['lushijie','1234560']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-notIn failure', t => {
  let rules = {
    arg: {
      notIn: ['lushijie','123456']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-notIn success', t => {
  let rules = {
    arg: {
      notIn: ['lushijie','123456']
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'avc'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-int failure', t => {
  let rules = {
    arg: {
      int: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123.456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-int success', t => {
  let rules = {
    arg: {
      int: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-int options failure', t => {
  let rules = {
    arg: {
      int: {min: 0, max: 10}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-int options success', t => {
  let rules = {
    arg: {
      int: {min: 0, max: 10}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '6'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-length options failure', t => {
  let rules = {
    arg: {
      length: {min: 0, max: 4}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-length options failure2', t => {
  let rules = {
    arg: {
      length: 4
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '1234'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-length options failure3', t => {
  let rules = {
    arg: {
      length: 4
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-length options success', t => {
  let rules = {
    arg: {
      length: {min: 0, max: 10}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-length-max-only', t => {
  let rules = {
    arg: {
      length: {max: 3}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-length-min-only', t => {
  let rules = {
    arg: {
      length: {min: 10}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123456'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-lowercase', t => {
  let rules = {
    arg: {
      lowercase: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'Abc'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-uppercase failure', t => {
  let rules = {
    arg: {
      uppercase: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'Abc'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-uppercase success', t => {
  let rules = {
    arg: {
      uppercase: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '$$$$$￥'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});


test('rule-mobile failure', t => {
  let rules = {
    arg: {
      mobile: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '1326920XXXX'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-mobile success', t => {
  let rules = {
    arg: {
      mobile: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '13269207867'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-mobile-locale', t => {
  let rules = {
    arg: {
      mobile: 'zh-CN'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '1326920888X'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-mongoId', t => {
  let rules = {
    arg: {
      mongoId: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '1326920'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-multibyte failure', t => {
  let rules = {
    arg: {
      multibyte: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'ABC'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-multibyte success', t => {
  let rules = {
    arg: {
      multibyte: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '$$$$$￥'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-url failure', t => {
  let rules = {
    arg: {
      url: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-url success2', t => {
  let rules = {
    arg: {
      url: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'https://github.com/lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-url success2', t => {
  let rules = {
    arg: {
      url: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: ''
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-url options success', t => {
  let rules = {
    arg: {
      url: {protocols: ['http','https','ftp']}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'https://github.com/lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-order failure', t => {
  let rules = {
    arg: {
      order: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'name|DESC'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-order success1', t => {
  let rules = {
    arg: {
      order: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'name ASC, id DESC'
    }
  });


  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-order success2', t => {
  let rules = {
    arg: {
      order: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: ''
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-field success1', t => {
  let rules = {
    arg: {
      field: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'name and title'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-field success2', t => {
  let rules = {
    arg: {
      field: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: ''
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-field success3', t => {
  let rules = {
    arg: {
      field: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '*'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-field success4', t => {
  let rules = {
    arg: {
      field: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'name, *'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-image', t => {
  let rules = {
    arg: {
      image: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'a.js'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-image-options', t => {
  let rules = {
    arg: {
      image: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: {originalFilename: 'a.js'},
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-startWith failure', t => {
  let rules = {
    arg: {
      startWith: 'shijie'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-startWith success', t => {
  let rules = {
    arg: {
      startWith: 'shijie'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'shijiesdf'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-endWith failure', t => {
  let rules = {
    arg: {
      endWith: 'lu'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-endWith success', t => {
  let rules = {
    arg: {
      endWith: 'jie'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-issn failure', t => {
  let rules = {
    arg: {
      issn: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123123'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-issn success', t => {
  let rules = {
    arg: {
      issn: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '2434-561X'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-issn-options', t => {
  let rules = {
    arg: {
      issn: {case_sensitive: false}
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123123'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});


test('rule-uuid failure', t => {
  let rules = {
    arg: {
      uuid: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123123'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-uuid success', t => {
  let rules = {
    arg: {
      uuid: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'A987FBC9-4BED-3078-CF07-9141BA07C9F3'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-md5 failure', t => {
  let rules = {
    arg: {
      md5: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123123'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-md5 success', t => {
  let rules = {
    arg: {
      md5: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'd94f3f016ae679c3008de268209132f2'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-macAddress failure', t => {
  let rules = {
    arg: {
      macAddress: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '1:2:3:4:5:6'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-macAddress success', t => {
  let rules = {
    arg: {
      macAddress: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '01:02:03:04:05:ab'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-dataURI failure', t => {
  let rules = {
    arg: {
      dataURI: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'abc'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-dataURI success', t => {
  let rules = {
    arg: {
      dataURI: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-regexp', t => {
  let rules = {
    arg: {
      regexp: /lushijie2/g
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-variableWidth failure', t => {
  let rules = {
    arg: {
      variableWidth: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-variableWidth success', t => {
  let rules = {
    arg: {
      variableWidth: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '$$$$$￥w'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-string failure', t => {
  let rules = {
    arg: {
      string: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 123
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-string success', t => {
  let rules = {
    arg: {
      string: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-object failure', t => {
  let rules = {
    arg: {
      object: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-object success', t => {
  let rules = {
    arg: {
      object: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: {a: 123},
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule method empty', t => {
  let rules = {
    arg: {
      required: true,
      method: ''
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule method not empty', t => {
  let rules = {
    arg: {
      required: true,
      method: 'get'
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-no-exist', t => {
  let rules = {
    arg: {
      notExist: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 'lushijie'
    }
  });

  let instance = new Validator(ctx);
  try{
    let ret = instance.validate(rules);
  }catch(e) {
    t.pass();
  }
});

test('rule-ip-no-required', t => {
  let rules = {
    arg: {
      ip: true,
      required: false
    }
  }
  let instance = new Validator(helper.extend({}, defaultCtx));
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule-add-method', t => {
  let rules = {
    arg: {
      default: 'lu',
      eqlushijie: true
    }
  }
  let wrongMsg = 'eqlushijie error';

  Validator.addRule('eqlushijie', function(value, { parsedValidValue }) {
    return parsedValidValue === 'lushijie';
  }, wrongMsg);
  Validator.addRule('_eqlushijie', function(validValue, { currentQuery }) {
    return currentQuery.arg + 'shijie';
  });
  let instance = new Validator(helper.extend({}, defaultCtx));
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0);
});

test('rule one-more-basic type', t => {
  let rules = {
    arg: {
      int: true,
      float: true
    }
  }
  let instance = new Validator(helper.extend({}, defaultCtx));
  try {
    let ret = instance.validate(rules);
  }catch(e) {
    t.pass();
  }
});

test('rule-boolean', t => {
  let rules = {
    arg: {
      boolean: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: 123
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(ctx.param().arg === false);
});

test('rule-array', t => {
  let rules = {
    arg: {
      array: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123'
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.deepEqual(ctx.param().arg, ['123']);
});

test('rule-int-convert', t => {
  let rules = {
    arg: {
      int: true,
      trim: true
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '123 '
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0 && ctx.param().arg === 123);
});

test('rule-array-nest', t => {
  let rules = {
    arg: {
      array: true,
      children: {
        int: true,
        trim: true
      }
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: ['12   ', 34, 56],
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0 && ctx.param().arg[0] === 12)
});

test('rule-array-nest 2', t => {
  let rules = {
    arg: {
      array: true,
      children: {
        int: true,
        trim: true
      }
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: '12,45,   67   ',
    }
  });
  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0 && ctx.param().arg[0] === 12)
});

test('rule-object-nest', t => {
  let rules = {
    arg: {
      object: true,
      children: {
        int: true,
        trim: true
      }
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg: {
        a: '123  '
      },
    }
  });

  let instance = new Validator(ctx);
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length === 0 && ctx.param().arg.a === 123)
});

test('rule\'method not match this.ctx.method', t => {
  let rules = {
    username: {
      required: true,
      method: 'POST'
    }
  }

  let instance = new Validator(helper.extend({}, defaultCtx));
  let ret = instance.validate(rules);
  t.true(Object.keys(ret).length > 0);
});

test('rule-name-custom-message', t => {
  let rules = {
    arg: {
      required: true
    },
    arg2: {
      required: true
    },
    arg3: {
      object: true,
      children: {
        int: true
      }
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg3: {
        a: 'aaa',
        b: 'abc',
        c: 'vvv',
        d: 'abc'
      }
    }
  });

  let msgs = {
    required: 'must required',
    arg: 'arg must required',
    arg2: {
      required: 'arg2 must required'
    },
    arg3: {
      'a,b': 'this is wrong for a,b',
      c: 'this is wrong for c',
      d: {
        int: 'this is wrong for d'
      }
    }
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules, msgs);
  t.true(
    ret.arg === msgs.arg &&
    ret.arg2 === msgs.arg2.required &&
    ret['arg3.a'] === msgs.arg3['a,b'] &&
    ret['arg3.c'] === msgs.arg3.c &&
    ret['arg3.d'] === msgs.arg3.d.int
  );
});

test('rule-name-custom-message-else', t => {
  let rules = {
    arg: {
      required: true
    },
    arg2: {
      required: true
    },
    arg3: {
      object: true,
      children: {
        int: true
      }
    },
    arg4: {
      object: true,
      children: {
        int: true
      }
    },
    arg5: {
      object: true,
      children: {
        int: true
      }
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg3: {
        a: 'aaa',
        b: 'abc',
        c: 'vvv',
        d: 'abc'
      },
      arg4: {
        e: 'aaa',
      },
      arg5: {
        f: 'aaa'
      }
    }
  });

  let msgs = {
    required: null,
    arg: null,
    arg2: {
      required: null
    },
    arg3: {
      'a,b': null,
      c: null,
      d: {
        int: null
      }
    },
    arg4: 'arg4 custom error',
    arg5: null
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules, msgs);

  let INT_ERROR = ' need an integer under your options';
  t.true(
    ret.arg === `arg${NOERROR}` &&
    ret.arg2 === `arg2${NOERROR}` &&
    ret['arg3.a'] === `arg3${INT_ERROR}` &&
    ret['arg3.b'] === `arg3${INT_ERROR}` &&
    ret['arg3.c'] === `arg3${INT_ERROR}` &&
    ret['arg3.d'] === `arg3${INT_ERROR}` &&
    ret['arg4.e'] === 'arg4 custom error' &&
    ret['arg5.f'] === `arg5${INT_ERROR}`
  );
});


test('rule-array-message', t => {
  let rules = {
    arg3: {
      array: true,
      children: {
        int: true
      }
    }
  }
  let ctx = helper.extend({}, defaultCtx, {
    PARAM: {
      arg3: ['1a']
    }
  });

  let msgs = {
    arg3: 'this is array custom message'
  }
  let instance = new Validator(ctx);
  let ret = instance.validate(rules, msgs);
  t.true(ret['arg3[0]'] === msgs.arg3);
});
