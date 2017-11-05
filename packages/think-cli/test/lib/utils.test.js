const test = require('ava')
const utils = require('../../lib/utils.js');

test('The correct prefix should be returned', t => {
  t.is(utils.getPrefix('/dir/dir2/test.js'), '../../../');
});

test('The correct action name should be returned', t => {
  t.is(utils.getActionName('test.js'), 'test');
});
