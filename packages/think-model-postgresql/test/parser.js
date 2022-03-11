const { test } = require('ava');
const Parser = require('../lib/parser');

test('parserKey', t => {
  t.plan(3);

  const parser = new Parser();
  t.is(parser.parseKey('aa bb'), '"aa bb"');
  t.is(parser.parseKey('lizheming'), '"lizheming"');
  t.is(parser.parseKey('where'), '"where"');
});

test('parseGroup', t => {
  const parser = new Parser();
  const data = [
    [111, undefined],
    [undefined, ''],
    ['(lizheming)', ' GROUP BY (lizheming)'],
    ['date_format(create_time, "%Y-%m-%d"', ' GROUP BY date_format(create_time, "%Y-%m-%d"'],
    ['id, create_time', ' GROUP BY "id", "create_time"'],
    ['id, create_time DESC', ' GROUP BY "id", "create_time" DESC'],
    ['"id ASC", create_time"', ' GROUP BY "id" ASC, "create_time"'],
    ['"user.id ASC", "user.create_time DESC"', ' GROUP BY "user"."id" ASC, "user"."create_time" DESC'],
    ['"user id ASC", "create_time hello DESC"', ' GROUP BY "user id" ASC, "create_time hello" DESC'],
    [{ name: 'DESC' }, ' GROUP BY "name" DESC'],
    [{ name: -1 }, ' GROUP BY "name" DESC'],
    [{ '"user.id ASC"': 333 }, ' GROUP BY "user"."id ASC" ASC'],
    [{ name: 'lizheming' }, ' GROUP BY "name"lizheming'],
    [{ name: true }, ' GROUP BY "name"true']
  ];

  t.plan(data.length);
  data.forEach(([params, except]) =>
    t.deepEqual(parser.parseGroup(params), except)
  );
});

test('parseLimit', t => {
  const parser = new Parser();
  const data = [
    [undefined, ''],
    [111, ' LIMIT 111'],
    [{ limit: 3 }, ' LIMIT 0'],
    [[5, 6], ' LIMIT 6 OFFSET 5'],
    ['3,4', ' LIMIT 4 OFFSET 3'],
    ['name,lizheming', ' LIMIT 0 OFFSET 0'],
    ['3,', ' LIMIT 3']
  ];

  t.plan(data.length);
  data.forEach(([params, except]) =>
    t.deepEqual(parser.parseLimit(params), except)
  );
});

test('parseValue', t => {
  const parser = new Parser();
  const data = [
    ['lizheming', "E'lizheming'"],
    ["I'm my wife's rock.", "E'I\\\'m my wife\\\'s rock.'"],
    [3, 3],
    [{ a: 1 }, { a: 1 }],
    [null, 'null'],
    [true, 'true'],
    [false, 'false'],
    [['EXP', '= 3'], '= 3'],
    [[{ a: 1 }, 3, true, null, ['EXP', ' = 3']], [{ a: 1 }, 3, 'true', 'null', ' = 3']],
    [Buffer.from('abcdefg'), "'\\x61626364656667'"]
  ];

  t.plan(data.length);
  data.forEach(([params, except]) =>
    t.deepEqual(parser.parseValue(params), except)
  );
});

test('buildInsertSql', t => {
  const parser = new Parser();
  const options = {
    pk: 'id',
    table: 'user',
    fields: 'id,name',
    value: '1,lizheming'
  };

  parser.__proto__.__proto__.buildInsertSql = function(opts) {
    t.deepEqual(opts, options);
    return 'INSERT INTO demo';
  };
  const sql = parser.buildInsertSql(options);
  t.is(sql, 'INSERT INTO demo RETURNING id');
});

test('buildInsertSql without pk', t => {
  const parser = new Parser();
  const options = {
    table: 'user',
    fields: 'id,name',
    value: '1,lizheming'
  };

  parser.__proto__.__proto__.buildInsertSql = function(opts) {
    t.deepEqual(opts, options);
    return 'INSERT INTO demo';
  };
  const sql = parser.buildInsertSql(options);
  t.is(sql, 'INSERT INTO demo');
});
