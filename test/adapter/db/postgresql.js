'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');


var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var PostgreSQL = think.safeRequire(path.resolve(__dirname, '../../../lib/adapter/db/postgresql.js'));


describe('adapter/db/postgresql.js', function(){
  it('get instance', function(){
    var instance = new PostgreSQL(),
        instance2 = new PostgreSQL({test: 1});
    assert.equal(instance.selectSql, '%EXPLAIN%SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT%%UNION%%COMMENT%');
    assert.deepEqual(instance2.config, {test: 1});
  });
  it('socket', function(){
    var instance = new PostgreSQL();
    var socket = instance.socket();
    assert.equal(think.isObject(socket), true);
  });
  it('socket, exist', function(){
    var instance = new PostgreSQL();
    var socket = instance.socket();
    var socket2 = instance.socket();
    assert.equal(socket, socket2);
  });
  it('execute', function (done) {
    var instance = new PostgreSQL(),
        testcases = [
          {
            sql_actual: "SELECT 1",
            sql_expect: "SELECT 1",
            data_actual: { rows: [] },
            data_expect: 0
          },
          {
            sql_actual: 'INSERT INTO "user" VALUES(1, 2)',
            sql_expect: 'INSERT INTO "user" VALUES(1, 2) RETURNING id',
            data_actual: { rows: [ {id: 1} ], rowCount: 1 },
            data_expect: 1
          }
        ],
        i = 0;
    instance.socket = function (sql) {
      assert.equal(sql, testcases[i].sql_expect);

      return { execute: function (sql) {
        assert.equal(sql, testcases[i].sql_expect);
        var result = Promise.resolve(testcases[i].data_actual);
        return result;
      } };
    };

    instance.execute(testcases[i].sql_actual).then(function (data) {
      assert.equal(data, testcases[i].data_expect);
      i++;
      instance.execute(testcases[i].sql_actual).then(function (data) {
        assert.equal(data, testcases[i].data_expect);
        done();
      });
    });
  });
  it('query', function (done) {
    var instance = new PostgreSQL(),
        testcases = [
          {
            sql_actual: "SELECT 1",
            sql_expect: "SELECT 1",
            data_actual: { rows: [] },
            data_expect: 0
          },
          {
            sql_actual: 'INSERT INTO "user" VALUES(1, 2)',
            sql_expect: 'INSERT INTO "user" VALUES(1, 2)',
            data_actual: { rows: [ { id: 1 } ], rowCount: 1 },
            data_expect: [ { id: 1 } ]
          }
        ],
        i = 0;
    instance.socket = function (sql) {
      assert.equal(sql, testcases[i].sql_expect);

      return { query: function (sql) {
        assert.equal(sql, testcases[i].sql_expect);
        var result = Promise.resolve(testcases[i].data_actual);
        return result;
      } };
    };

    instance.query(testcases[i].sql_actual).then(function (data) {
      assert.equal(data, testcases[i].data_expect);
      i++;

      instance.query(testcases[i].sql_actual).then(function (data) {
        assert.deepEqual(data, testcases[i].data_expect);

        done();
      });
    });
  });
  it('get fields', function(done){
    var instance = new PostgreSQL();
    var i = 0;

    var sqls     = [
        // Get columns:
        "SELECT column_name,is_nullable,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='user'",
        // Get indexes:
        "SELECT indexname,indexdef FROM pg_indexes WHERE tablename='user'"
      ],
      datas = [
        // Columns:
        [
          { column_name: 'id',    data_type: 'integer',           is_nullable: 'YES' },
          { column_name: 'name',  data_type: 'character varying', is_nullable: 'NO' },
          { column_name: 'title', data_type: 'character varying', is_nullable: 'NO' }
        ],
        // Indexes:
        [
          { indexname: 'user_pkey', indexdef: 'CREATE UNIQUE INDEX pkey ON user USING btree (id)' }
        ]
      ];

    instance.query = function(sql){
      var expected_sql = !!sqls[i]   ? sqls[i]  : 'UNKNOWN',
          expected_data = !!datas[i] ? datas[i] : [];
      assert.equal(sql, expected_sql);
      i++;
      return Promise.resolve(expected_data);
    };

    instance.getSchema('user').then(function (data) {
      assert.deepEqual(data, {
        id:    { name: 'id',    type: 'integer',           required: false, default: '', auto_increment: false, "primary":true,"unique":[null] },
        name:  { name: 'name',  type: 'character varying', required: true,  default: '', auto_increment: false },
        title: { name: 'title', type: 'character varying', required: true,  default: '', auto_increment: false }
      });
      done();
    })
  });
  it('startTrans', function (done) {
    var instance = new PostgreSQL();

    instance.transTimes = 0;

    instance.execute = function (sql) {
      assert.equal(sql, 'BEGIN');
      return Promise.resolve({ rows: [], rowCount: 0 });
    };

    instance.startTrans().then(function(data){

      assert.equal(instance.transTimes, 1);

      instance.startTrans().then(function(data){

        assert.equal(instance.transTimes, 2);
        done();
      });
    });


  });
  it('parseWhereItem, (key, null)', function () {
    var instance = new PostgreSQL();

    assert.equal(instance.parseWhereItem('some_field', null), 'some_field IS NULL');
  });
  it('parseWhereItem, complex', function () {
    var instance = new PostgreSQL(),
        data1 = { 'in': ['login1', 'login2'] },
        data2 = { '<': 10, '>': 1 },
        data3 = { '!=': null },
        data4 = { '=': null },
        data5 = [1, 2, 3],
        data6 = { '>': 1 },
        data7 = 'asd',
        data8 = ['BETWEEN', 1, 12],
        data9 = ['!=', null],
        data10 = ['>=', 1],
        data11 = ['LIKE', '%12%'],
        data12 = ['LIKE', ['%12%', '%13%']],
        data13 = ['EXP', 'IS NOT NULL'],
        data14 = ['NOT BETWEEN', 1, 12],
        data15 = ["IN", [10, 20]],
        data16 = ["IN", [10]],
        data17 = ["IN", '(E\'aa\', E\'bb\')', 'exp'],
        data18 = ["IN", 'a,b,c'],
        data19 = ["IN", 1],
        data20 = [["LIKE", '%123%'],["LIKE", '%234%'], "OR"],
        data21 = [["EXP", 'LIKE E\'%123%\''],["LIKE", '%234%']],
        data22 = ['NOT_BETWEEN', 1, 12];

    assert.equal(instance.parseWhereItem('login', data1), "login IN (E'login1', E'login2')");
    assert.equal(instance.parseWhereItem('id', data2), 'id < 10 AND id > 1');
    assert.equal(instance.parseWhereItem('id', data3), 'id IS NOT NULL');
    assert.equal(instance.parseWhereItem('id', data4), 'id IS NULL');
    assert.equal(instance.parseWhereItem('id', data5), 'id IN ( 1, 2, 3 )');
    assert.equal(instance.parseWhereItem('id', data6), 'id > 1');
    assert.equal(instance.parseWhereItem('id', data7), 'id = E\'asd\'');
    assert.equal(instance.parseWhereItem('id', data8), ' (id BETWEEN 1 AND 12)');
    assert.equal(instance.parseWhereItem('id', data9), 'id IS NOT NULL');
    assert.equal(instance.parseWhereItem('id', data10), 'id >= 1');
    assert.equal(instance.parseWhereItem('id', data11), 'id LIKE E\'%12%\'');
    assert.equal(instance.parseWhereItem('id', data12), '(id LIKE E\'%12%\' OR id LIKE E\'%13%\')');
    assert.equal(instance.parseWhereItem('id', data13), '(id IS NOT NULL)');
    assert.equal(instance.parseWhereItem('id', data14), ' (id NOT BETWEEN 1 AND 12)');
    assert.equal(instance.parseWhereItem('id', data15), 'id IN (10,20)');
    assert.equal(instance.parseWhereItem('id', data16), 'id = 10');
    assert.equal(instance.parseWhereItem('id', data17), "id IN (E'aa', E'bb')");
    assert.equal(instance.parseWhereItem('id', data18), "id IN (E'a',E'b',E'c')");
    assert.equal(instance.parseWhereItem('id', data19), 'id = 1');
    assert.equal(instance.parseWhereItem('id', data20), '(id LIKE E\'%123%\') OR (id LIKE E\'%234%\')');
    assert.equal(instance.parseWhereItem('id', data21), '(id LIKE E\'%123%\') AND (id LIKE E\'%234%\')');
    // Check exception:
    assert.throws(function () { return instance.parseWhereItem('id', data22); }, null, null);
  });
  it('quoteKey, empty', function () {
    var instance = new PostgreSQL();
    var data = instance.quoteKey();
    assert.equal(data, '')
  });
  it('quoteKey, normal', function () {
    var instance = new PostgreSQL();
    var data = instance.quoteKey(1);
    assert.equal(data, '1');

    data = instance.quoteKey('1');
    assert.equal(data, '1');

    data = instance.quoteKey('');
    assert.equal(data, '');

    data = instance.quoteKey('test');
    assert.equal(data, '"test"');

  });
  it('parseKey, undefined', function(){
    var instance = new PostgreSQL();
    var data = instance.parseKey();
    assert.equal(data, '')
  });
  it('parseKey, empty', function(){
    var instance = new PostgreSQL();
    var data = instance.parseKey('');
    assert.equal(data, "")
  });
  it('parseKey, special char', function(){
    var instance = new PostgreSQL();
    var data = instance.parseKey('te"st');
    assert.equal(data, "\"te\"\"st\"")
  });
  it('parseKey, normal', function(){
    var instance = new PostgreSQL();
    var data = instance.parseKey('test');
    assert.equal(data, "\"test\"");

    data = instance.parseKey('1');
    assert.equal(data, '1');

    data = instance.parseKey(1);
    assert.equal(data, '1');
  });
  it('parseKey', function(){
    var instance = new PostgreSQL();
    var data = instance.parseKey('test');
    assert.equal(data, "\"test\"")
  });
  it('parseKey, has special chars', function(){
    var instance = new PostgreSQL();
    var data = instance.parseKey('te"st');
    assert.equal(data, "\"te\"\"st\"")
  });
  it('parseKey, "table_name"."some_field"', function(){
    var instance = new PostgreSQL();
    var data = instance.parseKey('table_name.some_field');
    assert.equal(data, "\"table_name\".\"some_field\"")
  });
  it('parseKey, DISTINCT "table_name"."some_field"', function(){
    var instance = new PostgreSQL();
    var data = instance.parseKey('DISTINCT table_name.some_field');
    assert.equal(data, "DISTINCT \"table_name\".\"some_field\"")
  });
  it('parseKey, \'"table_name"."some_field"   \' (with spaces)', function(){
    var instance = new PostgreSQL();
    var data = instance.parseKey('DISTINCT table_name.some_field');
    assert.equal(data, "DISTINCT \"table_name\".\"some_field\"")
  });
  it('parseLimit', function () {
    var instance = new PostgreSQL();
    assert.equal(instance.parseLimit(null), "");
    assert.equal(instance.parseLimit(1), " LIMIT 1");
    assert.equal(instance.parseLimit('5,1'), " LIMIT 1 OFFSET 5");
    assert.equal(instance.parseLimit('5'), " LIMIT 5");
  });
  it('parseValue', function () {
    var instance = new PostgreSQL();

    var testcases = [
      {
        actual: ['exp', 1],
        expect: '1'
      },
      {
        actual: null,
        expect: 'null'
      },
      {
        actual: true,
        expect: 'true'
      },
      {
        actual: false,
        expect: 'false'
      }
    ];

    testcases.forEach(function (item) {
      assert.equal(instance.parseValue(item.actual), item.expect);
    });
  });
  it('parseGroup', function () {
    var instance = new PostgreSQL();
    var testcases = [
      {
        actual: '',
        expect: '',
      },
      {
        actual: undefined,
        expect: ''
      },
      {
        actual: '("id", "name")',
        expect: ' GROUP BY ("id", "name")',
      },
      {
        actual: 'name',
        expect: ' GROUP BY "name"',
      },
      {
        actual: '"table"."field"',
        expect: ' GROUP BY "table"."field"',
      },
      {
        actual: '"table"."field1", "table"."field2"',
        expect: ' GROUP BY "table"."field1", "table"."field2"',
      },
      {
        actual: 'name ASC',
        expect: ' GROUP BY "name" ASC'
      },
      {
        actual: 'name DESC',
        expect: ' GROUP BY "name" DESC'
      },
      {
        actual: '"name" DESC',
        expect: ' GROUP BY "name" DESC'
      },
      {
        actual: {'name': 'DESC'},
        expect: ' GROUP BY "name" DESC'
      },
      {
        actual: {'name': -1},
        expect: ' GROUP BY "name" DESC'
      },
      {
        actual: {'name': 1, 'id': -1},
        expect: ' GROUP BY "name" ASC, "id" DESC'
      },
      {
        actual: {'table.name': 1, 'table.id': -1},
        expect: ' GROUP BY "table"."name" ASC, "table"."id" DESC'
      },
      {
        actual: {'"table"."name"': 1, '"table"."id"': -1},
        expect: ' GROUP BY "table"."name" ASC, "table"."id" DESC'
      },
      {
        actual: 'name, id',
        expect: ' GROUP BY "name", "id"'
      },
      {
        actual: '"name", "id"',
        expect: ' GROUP BY "name", "id"'
      }
    ];

    testcases.forEach(function (item) {
      assert.equal(instance.parseGroup(item.actual), item.expect);
    })
  });
});