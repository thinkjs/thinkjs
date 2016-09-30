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
    var instance = new PostgreSQL();
    assert.equal(instance.selectSql, '%EXPLAIN%SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT%%UNION%%COMMENT%');
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
        []
      ];

    instance.query = function(sql){
      var expected_sql = !!sqls[i]   ? sqls[i]  : 'UNKNOWN',
          expected_data = !!datas[i] ? datas[i] : [];
      assert.equal(sql, expected_sql);
      i++;
      return Promise.resolve(expected_data);
    };

    instance.getSchema('user').then(function(data){

      assert.deepEqual(data, {
        id:    { name: 'id',    type: 'integer',           required: false, default: '', auto_increment: false },
        name:  { name: 'name',  type: 'character varying', required: true,  default: '', auto_increment: false },
        title: { name: 'title', type: 'character varying', required: true,  default: '', auto_increment: false }
      });
      done();
    })
  });
  it('parseKey, empty', function(){
    var instance = new PostgreSQL();
    var data = instance.parseKey();
    assert.equal(data, '')
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
});