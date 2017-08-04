const test = require('ava');

test('extend.allowExtends', t => {
  var allowExtends = require('../loader/extend').allowExtends;
  t.deepEqual(allowExtends, ['think', 'application', 'context', 'request', 'response', 'controller', 'logic', 'service']);
});
