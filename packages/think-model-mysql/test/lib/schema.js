const {test} = require('ava');
const Query = require('../../lib/query');
const Parser = require('../../lib/parser');
const Schema = require('../../lib/schema');

test('schema parser and query object', t => {
  t.plan(2);

  const schema = new Schema();
  t.true(schema.query instanceof Query);
  t.true(schema.parser instanceof Parser);
});

test('schema get empty schema', async t => {
  const schema = new Schema({});
  const result = await schema.getSchema();
  t.deepEqual(result, {});
});

test('schema get normal schema', async t => {
  const schema = new Schema({}, {});
  const tableFields = [
    {
      Field: 'id',
      Type: 'int(10) unsigned',
      Null: 'NO',
      Key: 'PRI',
      Default: null,
      Extra: 'auto_increment'
    },
    {
      Field: 'title',
      Type: 'varchar(255)',
      Null: 'NO',
      Key: '',
      Default: null,
      Extra: ''
    }
  ];

  Object.defineProperty(schema, 'query', {
    value: {
      query: sql => Promise.resolve(tableFields)
    }
  });

  const result = await schema.getSchema('post');
  t.deepEqual(result, {
    id: {
      name: 'id',
      type: 'int(10) unsigned',
      required: false,
      default: '',
      primary: true,
      unique: false,
      autoIncrement: true,
      tinyType: 'int',
      unsigned: true,
      validate: {
        int: {
          min: 0,
          max: 2147483647
        }
      }
    },
    title: {
      name: 'title',
      type: 'varchar(255)',
      required: false,
      default: '',
      primary: false,
      unique: false,
      autoIncrement: false,
      tinyType: 'varchar',
      validate: {}
    }
  });
});

test('schema parse type', t => {
  const schema = new Schema({});
  t.is(schema.parseType('enum', '1'), '1');
  t.is(schema.parseType('set', 'True'), 'True');
  t.is(schema.parseType('bigint', 'False'), 'False');
  t.is(schema.parseType('int(10)', '3'), 3);
  t.is(schema.parseType('double', '3.3'), 3.3);
  t.is(schema.parseType('float', '3.3'), 3.3);
  t.is(schema.parseType('decimal', '3.3'), 3.3);
  t.is(schema.parseType('bool', '0'), 1);
  t.is(schema.parseType('bool', ''), 0);
});
