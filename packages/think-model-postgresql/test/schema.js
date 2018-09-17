const { test } = require('ava');
const Schema = require('../lib/schema');

test('_getItemSchemaValidate', t => {
  const schema = new Schema();
  const data = [
    [{ tinyType: 'tinyint' }, { int: { min: 0, max: 255 } }],
    [{ tinyType: 'smallint' }, { int: { min: -32768, max: 32767 } }],
    [{ tinyType: 'smallint', unsigned: 1 }, { int: { min: 0, max: 32767 } }],
    [{ tinyType: 'int' }, { int: { min: -2147483648, max: 2147483647 } }],
    [{ tinyType: 'int', unsigned: 1 }, {
      int: { min: 0, max: 2147483647 }
    }],
    [{ tinyType: 'date' }, { date: true }],
    [{ unsigned: true }, {}]
  ];

  t.plan(data.length);
  data.forEach(([params, except]) =>
    t.deepEqual(schema._getItemSchemaValidate(params), except)
  );
});

test('_parseItemSchema', t => {
  const schema = new Schema();
  const data = [
    [
      { type: 'INT', default: '3', validate: 'hello' },
      { type: 'INT', tinyType: 'int', default: 3, validate: 'hello' }
    ],
    [
      { type: 'INT unsigned', default: '3' },
      { type: 'INT true', tinyType: 'int unsigned', default: 3, unsigned: true, validate: {} }
    ],
    // [
    //   { default() { return 'lizheming' } },
    //   { type: 'varchar(100)', tinyType: 'varchar', validate: {}, default() { return 'lizheming' } }
    // ]
    [
      {},
      { type: 'varchar(100)', tinyType: 'varchar', validate: {} }
    ]
  ];

  t.plan(data.length);
  data.forEach(([params, except]) =>
    t.deepEqual(schema._parseItemSchema(params), except)
  );
});

test('parseType', t => {
  const schema = new Schema();
  const data = [
    [['enum', 3], 3],
    [['set', [1, 2]], [1, 2]],
    [['bigint', 123], 123],
    [['smallint', '30'], 30],
    [['middleint', 'lizheming'], NaN],
    [['double', '3.14'], 3.14],
    [['float', '3.14'], 3.14],
    [['decimal', '3.14'], 3.14],
    [['bool', 'true'], 1],
    [['bool', undefined], 0],
    [['boolean', 'hello'], 'hello']
  ];

  t.plan(data.length);
  data.forEach(([params, except]) =>
    t.deepEqual(schema.parseType(...params), except)
  );
});

test.todo('getSchema');
