const {test} = require('ava');
const Values = require('../../src/lib/values');

test('toboolean normal', t => {
  let arr = ['yes', 'on', '1', 'true', true];
  t.plan(arr.length);
  arr.forEach(val => t.is(Values._toBoolean(val), true));
});

test('toboolean abnormal', t => {
  t.is(Values._toBoolean('lizheming'), false);
});

test('get rule values normal', t => {
  let data = Values._getRuleValues({
    a : {
      value: 3
    },
    b: {
      value: 4
    }
  });
  t.deepEqual(data, {a: 3, b: 4});
});

test('get rule values abnormal', t => {
  let data = Values._getRuleValues({
    a: 3,
    b: {
      value: 4
    }
  });
  t.deepEqual(data, {a: undefined, b: 4});
});

test('parse value normal', t => {
  t.plan(6);
  t.is(Values._parseValue('3', {int: true}), 3);
  t.is(Values._parseValue('3', {type: 'int'}), 3);
  t.is(Values._parseValue('3.0', {float: true}), 3);
  t.is(Values._parseValue('3.123', {type: 'float'}), 3.123);
  t.is(Values._parseValue('true', {boolean: true}), true);
  t.is(Values._parseValue('true', {type: 'boolean'}), true);
});

test('parse abnormal value', t => {
  t.plan(6);
  t.true(Number.isNaN(Values._parseValue({}, {int: true})));
  t.deepEqual(Values._parseValue({}, {int: false}), {});
  t.true(Number.isNaN(Values._parseValue({}, {float: true})));
  t.deepEqual(Values._parseValue({}, {float: false}), {});
  t.is(Values._parseValue({}, {boolean: true}), false);
  t.deepEqual(Values._parseValue({}, {int: false}), {});
});

test('get item value string', t => {
  t.is(Values._getItemValue({value: '3'}), '3');
  t.is(Values._getItemValue({value: '  lizheming  '}), '  lizheming  ');
  t.is(Values._getItemValue({
    value: '  lizheming  ',
    trim: true
  }), 'lizheming');
  t.deepEqual(Values._getItemValue({
    value: '  lizheming  ',
    trim: true,
    array: true
  }), ['lizheming']);
  t.deepEqual(Values._getItemValue({
    value: 'true',
    boolean: true,
    array: true
  }), true);
  t.deepEqual(Values._getItemValue({
    value: 'thinkjs,  firekylin',
    array: true
  }), ['thinkjs', 'firekylin']);
  t.deepEqual(Values._getItemValue({
    value: JSON.stringify([{a:1, b:2}]),
    array: true
  }), [{a:1,b:2}]);
  t.deepEqual(Values._getItemValue({
    value: JSON.stringify({a:1, b:2}),
    object: true
  }), {a:1,b:2});
  t.deepEqual(Values._getItemValue({
    value: 'true,1',
    boolean: true,
    array: true
  }, {}, true), [true, true]);
});

test('get item value by default', t => {
  t.is(Values._getItemValue({default: 3}), 3);
  t.is(Values._getItemValue({default: ''}), undefined);
  t.is(Values._getItemValue({default: () => 3 * 4}), 12);
  t.is(Values._getItemValue({
    default: function() { return this.name; }
  }, {name: 3}), 3);
  t.is(Values._getItemValue({
    default: function() { return this.name; }
  }, {}), undefined);
});