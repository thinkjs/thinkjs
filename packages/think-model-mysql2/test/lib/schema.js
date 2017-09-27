const {test} = require('ava');
const Query = require('../../lib/query');
const Parser = require('../../lib/parser');
const Schema = require('../../lib/schema');

test('schema parser and query object', t => {
  t.plan(2);

  const schema = new Schema();
  schema.query = new Query();
  schema.parser = new Parser();
  t.true(schema.query instanceof Query);
  t.true(schema.parser instanceof Parser);
});

test('parser is getter', t => {
  const instance = new Schema();
  instance.query = new Query();
  instance.parser = new Parser();
  const parser = instance.parser;
  t.true(parser instanceof Parser, true);
});

test('parser is getter 2', t => {
  const instance = new Schema();
  instance.query = new Query();
  instance.parser = new Parser();
  const parser = instance.parser;
  const parser2 = instance.parser;
  t.true(parser instanceof Parser, true);
  t.true(parser === parser2, true);
});

test('query is getter', t => {
  const instance = new Schema();
  instance.query = new Query();
  instance.parser = new Parser();
  const query = instance.query;
  t.true(query instanceof Query, true);
});

test('query is getter 2', t => {
  const instance = new Schema();
  instance.query = new Query();
  instance.parser = new Parser();
  const query = instance.query;
  const query2 = instance.query;
  t.true(query instanceof Query, true);
  t.true(query === query2, true);
});

test('schema get empty schema', async t => {
  const schema = new Schema({});
  schema.query = new Query();
  schema.parser = new Parser();
  const result = await schema.getSchema();
  t.deepEqual(result, {});
});

test('schema get empty schema 2', async t => {
  const schema = new Schema({});
  schema.query = new Query();
  schema.parser = new Parser();
  const result = await schema.getSchema();
  const result2 = await schema.getSchema();
  t.deepEqual(result, {});
  t.is(result, result2);
});

test('schema get normal schema', async t => {
  const schema = new Schema({}, {});
  schema.query = new Query();
  schema.parser = new Parser();
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

  const result = await schema.getSchema('post1');
  t.deepEqual(result, {
    id: {
      name: 'id',
      type: 'int(10)',
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

test('schema get normal schema 2', async t => {
  const schema = new Schema({}, {
    title: {
      default: 'title'
    }
  }, 'test');
  schema.query = new Query();
  schema.parser = new Parser();
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

  const result = await schema.getSchema('post2');
  t.deepEqual(result, {
    id: {
      name: 'id',
      type: 'int(10)',
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
      default: 'title',
      primary: false,
      unique: false,
      autoIncrement: false,
      tinyType: 'varchar',
      validate: {}
    }
  });
});

test('schema get normal schema 3', async t => {
  const schema = new Schema({}, {
    title: {
      default: 'title'
    }
  }, 'test');
  schema.query = new Query();
  schema.parser = new Parser();
  const tableFields = [
    {
      Field: 'id',
      Type: 'int(10) unsigned',
      Null: 'NO',
      Key: 'PRI',
      Default: '111',
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

  const result = await schema.getSchema('post3');
  t.deepEqual(result, {
    id: {
      name: 'id',
      type: 'int(10)',
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
      default: 'title',
      primary: false,
      unique: false,
      autoIncrement: false,
      tinyType: 'varchar',
      validate: {}
    }
  });
});
test('schema get normal schema 4', async t => {
  const schema = new Schema({}, {
    id: {
      validate: {
        int: {min: 0, max: 1}
      }
    },
    title: {
      default: 'title'
    }
  }, 'test');
  schema.query = new Query();
  schema.parser = new Parser();
  const tableFields = [
    {
      Field: 'id',
      Type: 'int(10) unsigned',
      Null: 'NO',
      Key: 'PRI',
      Default: '111',
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

  const result = await schema.getSchema('post4');
  t.deepEqual(result, {
    id: {
      name: 'id',
      type: 'int(10)',
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
          max: 1
        }
      }
    },
    title: {
      name: 'title',
      type: 'varchar(255)',
      required: false,
      default: 'title',
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
  t.is(schema.parseType('int(10)', 'fasdfadf'), 0);
  t.is(schema.parseType('double', '3.3'), 3.3);
  t.is(schema.parseType('float', '3.3'), 3.3);
  t.is(schema.parseType('float', 'fasdfasdf'), 0);
  t.is(schema.parseType('decimal', '3.3'), 3.3);
  t.is(schema.parseType('bool', '0'), 1);
  t.is(schema.parseType('bool', ''), 0);
  t.is(schema.parseType('xxx', 'aaa'), 'aaa');
});
