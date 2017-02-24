/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-24 09:59:56
*/
import test from 'ava';
import thinkHelper from 'think-helper';
// import thinkValidate from '../index.js';
import validatorRule from '../rules.js';
// import util from 'util';

// // check already exist validation
// test('CheckExistValidation', t => {
//   t.true(thinkValidate('required')('123'));
// });

// // add custom validation
// test('AddCustomValidation', t => {
//   thinkValidate('lushijie', (value, ...args) => {
//     //console.log('extra args-->', args);
//     return value === 'lushijie';
//   });
//   t.true(thinkValidate('lushijie')('lushijie'));
// });

// // rules validate
// test('RulesValidation', t => {
//   let rules = {
//     mydate: {
//       date: true,
//       value: '2017-02-22'
//     },
//     myint: {
//       int: true,
//       value: '12.89'
//     }
//   };

//   let out = thinkValidate(rules);
//   t.true(thinkHelper.isObject(out))
//   && t.true(out.mydate === undefined)
//   && t.true(out.myint !== undefined);
// });

// // custom error message
// test('RulesValidation', t => {
//   let rules = {
//     mydate: {
//       date: true,
//       value: '2017-02-22-12'
//     },
//     myint: {
//       int: true,
//       value: '12.89'
//     }
//   };
//   let msgs = {
//     validate_int_myint: 'This is not integer!',
//     validate_date: 'This is not date!'
//   }
//   let out = thinkValidate(rules, msgs);
//   t.true(out.mydate === msgs.validate_date)
//   && t.true(out.myint === msgs.validate_int_myint);
// });

// // get rules value
// test('RulesValidation', t => {
//   let rules = {
//     mydate: {
//       date: true,
//       value: '2017-02-22-12'
//     },
//     myint: {
//       int: true,
//       value: '12.89'
//     }
//   };
//   let out = thinkValidate.values(rules);
//   t.true(out.mydate === rules.mydate.value)
//   && t.true(out.myint === rules.myint.value);
// });


// validator rules

// required
test('required', t => {
  let out1 = validatorRule.required('lushijie');
  let out2 = validatorRule.required('');
  t.true(out1 && !out2);
});

// requiredIf
test('requiredIf', t => {
  let out1 = validatorRule.requiredIf('', 'email', 'email', 'email1', 'email2');
  let out2 = validatorRule.requiredIf('lushijie', 'email', 'email', 'email1', 'email2');
  let out3 = validatorRule.requiredIf('', 'email', 'email0', 'email1', 'email2');
  let out4 = validatorRule.requiredIf('lushijie', 'email', 'email0', 'email1', 'email2');
  t.true(!out1 && out2 && out3 && out4);
});

// _requiredIf
test('_requiredIf', t => {
  let args = ['name'];
  let out1 = validatorRule._requiredIf(args.slice(), {});
  let out2 = validatorRule._requiredIf(args.slice(), {name:{value: 'lushijie'}});
  t.true(out1[0] === '' && out2[0] === 'lushijie');
});

// requiredNotIf
test('requiredNotIf', t => {
  let out1 = validatorRule.requiredNotIf('', 'email', 'email', 'email1', 'email2');
  let out2 = validatorRule.requiredNotIf('lushijie', 'email', 'email', 'email1', 'email2');
  let out3 = validatorRule.requiredNotIf('', 'email', 'email0', 'email1', 'email2');
  let out4 = validatorRule.requiredNotIf('lushijie', 'email', 'email0', 'email1', 'email2');
  t.true(out1 && out2 && !out3 && out4);
});

// _requiredNotIf
test('_requiredNotIf', t => {
  let args = ['name'];
  let out1 = validatorRule._requiredNotIf(args.slice(), {});
  let out2 = validatorRule._requiredNotIf(args.slice(), {name:{value: 'lushijie'}});
  t.true(out1[0] === '' && out2[0] === 'lushijie');
});

// requiredWith
test('requiredWith', t => {
  let out1 = validatorRule.requiredWith('', []);
  let out2 = validatorRule.requiredWith('', ['a', 'b', 'c']);
  let out3 = validatorRule.requiredWith('lushijie', ['a', '', 'c']);
  t.true(out1 && !out2 && out3);
});

// _requiredWith
test('_requiredWith', t => {
  let out1 = validatorRule._requiredWith(['a', 'b'], {a: {value: 123}});
  t.true((out1[0] === 123) && (out1[1] === ''));
});

// contains
test('contains', t => {
  let out1 = validatorRule.contains('', 'lu');
  let out2 = validatorRule.contains('lushijie', 'lu');
  t.true(out1 && out2);
});


//float
test('float', t => {
  let out1 = validatorRule.float('');
  let out2 = validatorRule.float('65M');
  let out3 = validatorRule.float('34.00', 23, 56);
  let out4 = validatorRule.float('34.00', 23, 33);
  let out5 = validatorRule.float('34.00', 35, 56);
  let out6 = validatorRule.float('34.00', 23);
  let out7 = validatorRule.float('34.00', 35);
  t.true(out1 && !out2 && out3 && !out4 && !out5 && out6 && !out7);
});

// fullWidth
test('fullWidth', t => {
  let out0 = validatorRule.fullWidth('');
  let out1 = validatorRule.fullWidth('￥$$$');
  t.true(out0 && out1);
});

// halfWidth
test('halfWidth', t => {
  let out0 = validatorRule.halfWidth('');
  let out1 = validatorRule.halfWidth('￥$$');
  t.true(out0 && out1);
});

// hexColor
test('hexColor', t => {
  let out0 = validatorRule.hexColor('');
  let out1 = validatorRule.hexColor('#000000');
  let out2 = validatorRule.hexColor('#000');
  t.true(out0 && out1 && out2);
});

// hex
test('hex', t => {
  let out0 = validatorRule.hex('');
  let out1 = validatorRule.hex('a0a');
  t.true(out0 && out1);
});

// ip
test('ip', t => {
  let out0 = validatorRule.ip('');
  let out1 = validatorRule.ip('127.0.0.1');
  let out2 = validatorRule.ip('2031:0000:1F1F:0000:0000:0100:11A0:ADD');
  t.true(out0 && out1 && out2);
});

// ip4
test('ip4', t => {
  let out0 = validatorRule.ip4('');
  let out1 = validatorRule.ip4('127.0.0.1');
  let out2 = validatorRule.ip4('256.0.0.0');
  t.true(out0 && out1 && !out2);
});

// ip6
test('ip6', t => {
  let out0 = validatorRule.ip6('');
  let out1 = validatorRule.ip6('2031:0000:1F1F:0000:0000:0100:11A0:ADD');
  let out2 = validatorRule.ip6('127.0.0.1');
  t.true(out0 && out1 && !out2);
});

//iso8601
test('iso8601', t => {
  let out0 = validatorRule.iso8601('');
  let out1 = validatorRule.iso8601('2011-09-11');
  let out2 = validatorRule.iso8601('2011-09-11-123');
  t.true(out0 && out1 && !out2);
});

//in
test('in', t => {
  let out0 = validatorRule.in('');
  let out1 = validatorRule.in('1.2', '1.2', '2.3');
  let out2 = validatorRule.in('1.2', '1.3', '1.4');
  let out3 = validatorRule.in('lu', 'lushijie', 'shijie');
  t.true(out0 && out1 && !out2 && !out3);
});

//notIn
test('notIn', t => {
  let out0 = validatorRule.notIn('')
  let out1 = validatorRule.notIn('1.2', '1.2', '2.3');
  let out2 = validatorRule.notIn('1.2', '1.3', '1.4');
  let out3 = validatorRule.notIn('lu', 'lushijie', 'shijie');
  t.true(out0 && !out1 && out2 && out3);
});

//int
test('int', t => {
  let out1 = validatorRule.int('');
  let out2 = validatorRule.int('65M');
  let out3 = validatorRule.int('34', 23, 56);
  let out4 = validatorRule.int('34', 23, 33);
  let out5 = validatorRule.int('34', 35, 56);
  let out6 = validatorRule.int('34', 23);
  let out7 = validatorRule.int('34', 35);
  t.true(out1 && !out2 && out3 && !out4 && !out5 && out6 && !out7);
})

// min
test('min', t => {
  let out1 = validatorRule.min('');
  let out2 = validatorRule.min('6', 6);
  let out3 = validatorRule.min('6', 10);
  let out4 = validatorRule.min('lushijie', 10);
  t.true(out1 && out2 && !out3 && !out4);
});

// max
test('max', t => {
  let out1 = validatorRule.max('');
  let out2 = validatorRule.max('6', 8);
  let out3 = validatorRule.max('10', 8);
  let out4 = validatorRule.min('lushijie', 10);
  t.true(out1 && out2 && !out3 && !out4);
});

// length
test('length', t => {
  let out1 = validatorRule.length('');
  let out2 = validatorRule.length('lushijie', 4, 10);
  let out3 = validatorRule.length('lushijie', 4, 6);
  let out4 = validatorRule.length('lushijie', 10, 12);
  let out5 = validatorRule.length('lushijie');
  t.true(out1 && out2 && !out3 && !out4 && out5);
});

// minLength
test('minLength', t => {
  let out1 = validatorRule.minLength('');
  let out2 = validatorRule.minLength('Lushijie', 8);
  let out3 = validatorRule.minLength('lushijie', 10);
  t.true(out1 && out2 && !out3);
});

// maxLength
test('maxLength', t => {
  let out1 = validatorRule.maxLength('');
  let out2 = validatorRule.maxLength('Lushijie', 8);
  let out3 = validatorRule.maxLength('lushijie12', 8);
  t.true(out1 && out2 && !out3);
});

// lowercase
test('lowercase', t => {
  let out1 = validatorRule.lowercase('');
  let out2 = validatorRule.lowercase('Lushijie');
  let out3 = validatorRule.lowercase('lushijie');
  t.true(out1 && !out2 && out3);
});

// mobile
test('mobile', t => {
  let out1 = validatorRule.mobile('');
  let out2 = validatorRule.mobile('13269209969');
  let out3 = validatorRule.mobile('13269209969', 'zh-CN');
  t.true(out1 && out2 && out3);
});

// mongoId
test('mongoId', t => {
  let out1 = validatorRule.mongoId('');
  let out2 = validatorRule.mongoId('542c2b97bac0595474108b48');
  let out3 = validatorRule.mongoId('123456');
  t.true(out1 && out2 && !out3);
});

// multibyte
test('multibyte', t => {
  let out1 = validatorRule.multibyte('奇舞团');
  let out2 = validatorRule.multibyte('lushijie');
  t.true(out1 && !out2);
});

// url
test('url', t => {
  let out1 = validatorRule.url('');
  let out2 = validatorRule.url('http://www.baidu.com');
  let out3 = validatorRule.url('https://www.so.com/');
  let out4 = validatorRule.url('www.so.com');
  t.true(out1 && out2 && out3 && !out4);
});

// uppercase
test('uppercase', t => {
  let out1 = validatorRule.uppercase('');
  let out2 = validatorRule.uppercase('LUSHIJIE');
  let out3 = validatorRule.uppercase('LUSHIJIEhello');
  t.true(out1 && out2 && !out3);
});

// variableWidth
test('variableWidth', t => {
  let out1 = validatorRule.variableWidth('');
  let out2 = validatorRule.variableWidth('lushijielushijielushijielushijie');
  t.true(out1 && !out2);
});

// startWith
test('startWith', t => {
  let out1 = validatorRule.startWith('', 'jie');
  let out2 = validatorRule.startWith('lushijie', 'lu');
  let out3 = validatorRule.startWith('lushijie', 'jie');
  t.true(out1 && out2 && !out3);
});

// endWith
test('endWith', t => {
  let out1 = validatorRule.endWith('', 'jie');
  let out2 = validatorRule.endWith('lushijie', 'jie');
  let out3 = validatorRule.endWith('lushijie', 'shi');
  t.true(out1 && out2 && !out3);
});

// regexp
test('regexp', t => {
  let out1 = validatorRule.regexp('lushijie', /lushijie/);
  let out2 = validatorRule.regexp('', /lushijie/);
  t.true(out1 && out2);
});

// type
test('type', t => {
  let out1 = validatorRule.type('');
  let out2 = validatorRule.type('123', 'int');
  let out3 = validatorRule.type('123.12', 'float');
  let out4 = validatorRule.type(true, 'boolean');
  let out5 = validatorRule.type([2, 3], 'array');
  let out6 = validatorRule.type({a: 1, b: 2}, 'object');
  let out7 = validatorRule.type('this is string', 'xxx');
  t.true(out1 && out2 && out3 && out4 && out5 && out6 && out7);
});
