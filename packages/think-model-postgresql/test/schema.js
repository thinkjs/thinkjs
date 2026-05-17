const { test } = require('ava');
const mock = require('mock-require');
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
      { type: 'INT', tinyType: 'int unsigned', default: 3, unsigned: true, validate: {} }
    ],
    // [
    //   { default: function() { return 'lizheming' } },
    //   { type: 'varchar(100)', tinyType: 'varchar', validate: {}, default: function() { return 'lizheming' } }
    // ],
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

test('getSchema with error index', async t => {
  t.plan(5);

  const table = 'user';

  mock('think-debounce', class {
    debounce(key, fn) {
      t.is(key, `getTable${table}Schema`);
      t.true(typeof fn === 'function');
      return Promise.resolve().then(fn);
    }
  });
  const Schema = mock.reRequire('../lib/schema');
  const schema = new Schema();
  schema.query = {
    query(sql) {
      if (sql.includes('column')) {
        t.is(sql, `SELECT column_name,is_nullable,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='${table}'`);
        return Promise.resolve([
          {
            column_name: 'id',
            data_type: 'int',
            is_nullable: 'NO'
          },
          {
            column_name: 'name',
            data_type: 'varchar(100)'
          }
        ]);
      } else {
        t.is(sql, `SELECT indexname,indexdef FROM pg_indexes WHERE tablename='${table}'`);
        return new Promise((resolve, reject) => {
          reject(new Error('error check'));
        });
      }
    }
  };
  schema._parseItemSchema = function(key) {
    return key;
  };
  schema.schema = {
    a: 1
  };
  const ret = await schema.getSchema(table);
  t.deepEqual(ret, {
    a: 1,
    id: {
      name: 'id',
      type: 'int',
      required: true,
      primary: false,
      unique: false,
      default: '',
      autoIncrement: false
    },
    name: {
      name: 'name',
      type: 'varchar(100)',
      required: false,
      primary: false,
      unique: false,
      default: '',
      autoIncrement: false
    }
  });
  mock.stopAll();
});

test('getSchema', async t => {
  t.plan(8);

  const table = 'user';

  mock('think-debounce', class {
    debounce(key, fn) {
      t.is(key, `getTable${table}Schema`);
      t.true(typeof fn === 'function');
      return Promise.resolve().then(fn);
    }
  });
  const Schema = mock.reRequire('../lib/schema');
  const schema = new Schema();
  schema.table = table;
  schema.query = {
    query(sql) {
      if (sql.includes('column')) {
        t.is(sql, `SELECT column_name,is_nullable,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='${table}'`);
        return Promise.resolve([
          {
            column_name: 'id',
            data_type: 'int',
            is_nullable: 'NO'
          },
          {
            column_name: 'name',
            data_type: 'varchar(100)'
          }
        ]);
      } else {
        t.is(sql, `SELECT indexname,indexdef FROM pg_indexes WHERE tablename='${table}'`);
        return Promise.resolve([
          { indexdef: '(id) pkey ', indexname: 'id' },
          { indexdef: '(name)', indexname: 'name' },
          { indexdef: 'wrong index', indexname: 'wrong' }
        ]);
      }
    }
  };
  schema._parseItemSchema = function(key) {
    t.true(key.name === 'id' || key.name === 'name');
    return key;
  };
  const ret = await schema.getSchema(table);
  t.deepEqual(ret, {
    id: {
      name: 'id',
      type: 'int',
      required: true,
      primary: true,
      unique: false,
      default: '',
      autoIncrement: false
    },
    name: {
      name: 'name',
      type: 'varchar(100)',
      required: false,
      primary: false,
      unique: false,
      default: '',
      autoIncrement: false
    }
  });

  schema.schema = {
    a: 1,
    b: 2
  };
  const ret2 = await schema.getSchema();
  t.deepEqual(ret2, {
    id: {
      name: 'id',
      type: 'int',
      required: true,
      primary: true,
      unique: false,
      default: '',
      autoIncrement: false
    },
    name: {
      name: 'name',
      type: 'varchar(100)',
      required: false,
      primary: false,
      unique: false,
      default: '',
      autoIncrement: false
    }
  });

  mock.stopAll();
});
