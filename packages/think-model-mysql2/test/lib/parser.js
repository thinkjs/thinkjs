const ava = require('ava');
const helper = require('think-helper');
const Base = require('../../lib/parser');

ava.test('escapeString is function', t => {
  const instance = new Base();
  t.true(helper.isFunction(instance.escapeString));
});

ava.test('escapeString, empty', t => {
  const instance = new Base();
  const data = instance.escapeString();
  t.is(data, '');
});

ava.test('escapeString, \\n', t => {
  const instance = new Base();
  const data = instance.escapeString('\n');
  t.is(data, '\\n');
});

ava.test('escapeString, \\0', t => {
  const instance = new Base();
  const data = instance.escapeString('\0');
  t.is(data, '\\0');
});

ava.test('escapeString, \\r', t => {
  const instance = new Base();
  const data = instance.escapeString('\r');
  t.is(data, '\\r');
});

ava.test('escapeString, \\b', t => {
  const instance = new Base();
  const data = instance.escapeString('\b');
  t.is(data, '\\b');
});

ava.test('escapeString, \\t', t => {
  const instance = new Base();
  const data = instance.escapeString('\t');
  t.is(data, '\\t');
});

ava.test('escapeString, \\Z', t => {
  const instance = new Base();
  const data = instance.escapeString('\u001a');
  t.is(data, '\\Z');
});

ava.test('escapeString, \\"', t => {
  const instance = new Base();
  const data = instance.escapeString('"');
  t.is(data, '\\"');
});

ava.test('parseKey is function', t => {
  const cases = [
    ['key', '`key`'],
    ['    ', ''],
    [' 3 ', '3'],
    ['3,', '3,'],
    ['3\'', '3\''],
    ['3"', '3"'],
    ['3*', '3*'],
    ['3(', '3('],
    ['3)', '3)'],
    ['3 3', '3 3'],
    ['`3`', '`3`'],
    ['3.3', '3.3'],
    ['li.zheming', 'li.zheming']
  ];
  t.plan(cases.length);
  const instance = new Base();
  cases.forEach(([param, expect]) => t.is(instance.parseKey(param), expect));
});

ava.test('buildInsertSql with super', t => {
  const instance = new Base();
  instance.__proto__.__proto__.buildInsertSql = function() {
    t.pass();
    return 'lizheming';
  };

  const params = [
    [{}, null],
    [{}, true]
  ];

  t.plan(params.length * 2);
  params.forEach(param =>
    t.is(instance.buildInsertSql.apply(instance, param), 'lizheming')
  );
});

ava.test('buildInsertSql with array update', t => {
  const instance = new Base();
  const options = {
    table: 'user',
    fields: 'id, name, email',
    values: '1, "lizheming", "i@imnerd.org"',
    update: ['id', 'title'],
    lock: 'lock',
    comment: 'comment'
  };

  instance.parseTable = function(table) {
    t.is(table, options.table);
    return table;
  };

  instance.parseKey = function(key) {
    return '$' + key + '$';
  };

  instance.parseLock = function(lock) {
    t.is(lock, 'lock');
    return '';
  };

  instance.parseComment = function(comment) {
    t.is(comment, 'comment');
    return '';
  };

  t.is(
    instance.buildInsertSql(options),
    'INSERT INTO user (id, name, email) VALUES (1, "lizheming", "i@imnerd.org") ON DUPLICATE KEY UPDATE $id$=VALUES($id$),$title$=VALUES($title$)'
  );
});

ava.test('buildInsertSql with object update', t => {
  const instance = new Base();
  const options = {
    table: 'user',
    fields: 'id, name, email',
    values: '(1, "lizheming", "i@imnerd.org")',
    update: {
      name: 'lizheming111',
      title: { a: 1 }
    },
    lock: 'lock',
    comment: 'comment'
  };

  instance.parseTable = function(table) {
    t.is(table, options.table);
    return table;
  };

  instance.parseKey = function(key) {
    return '$' + key + '$';
  };

  instance.parseValue = function(value) {
    if (typeof value === 'string') {
      t.is(value, 'lizheming111');
      return '`' + value + '`';
    } else {
      t.deepEqual(value, { a: 1 });
      return value;
    }
  };

  instance.parseLock = function(lock) {
    t.is(lock, 'lock');
    return ' lock2';
  };

  instance.parseComment = function(comment) {
    t.is(comment, 'comment');
    return ' comment2';
  };

  t.is(
    instance.buildInsertSql(options),
    'INSERT INTO user (id, name, email) VALUES (1, "lizheming", "i@imnerd.org") ON DUPLICATE KEY UPDATE $name$=`lizheming111` lock2 comment2'
  );
});

ava.test('buildInsertSql with empty update', t => {
  const instance = new Base();
  const options = {
    table: 'user',
    fields: 'id, name, email',
    values: '(1, "lizheming", "i@imnerd.org")',
    update: {
      // name: 'lizheming111',
      title: { a: 1 }
    },
    lock: 'lock',
    comment: 'comment'
  };

  instance.parseLock = instance.parseComment = () => '';

  t.is(
    instance.buildInsertSql(options),
    'INSERT INTO `user` (id, name, email) VALUES (1, "lizheming", "i@imnerd.org")'
  );
});
