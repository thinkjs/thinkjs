const test = require('ava')
const utils = require('../../lib/utils.js');

test('The correct prefix should be returned', t => {
  t.is(utils.getPrefix('/dir/dir2/test.js'), '../../');
  t.is(utils.getPrefix('/test.js'), './');
  t.is(utils.getPrefix('test'), './');
});

test('The correct action name should be returned', t => {
  t.is(utils.getActionName('test.js'), 'test');
});

test('utils.parsePath', t => {
  const data = {a: {b: {c : 'hello'}}};
  t.is(utils.parsePath('a.b.c')(data), 'hello');
});

test('utils.isLocalPath', t => {
  const data = {a: {b: {c : 'hello'}}};
  t.is(utils.isLocalPath('./a/b/c'), true);
  t.is(utils.isLocalPath('/a/b/c'), true);
  t.is(utils.isLocalPath('a/b'), false);
});
