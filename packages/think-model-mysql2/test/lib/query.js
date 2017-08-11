const ava = require('ava');
const helper = require('think-helper');
const Base = require('../../lib/query');
const Parser = require('../../lib/parser');

ava.test('socket is function', t => {
  const instance = new Base();
  t.true(helper.isFunction(instance.socket));
});

ava.test('parser is getter', t => {
  const instance = new Base();
  instance.parser = new Parser();
  const parser = instance.parser;
  t.true(parser instanceof Parser, true);
});

ava.test('parser is getter 2', t => {
  const instance = new Base();
  instance.parser = new Parser();
  const parser = instance.parser;
  const parser2 = instance.parser;
  t.true(parser instanceof Parser, true);
  t.true(parser === parser2, true);
});

ava.test('query', async t => {
  t.plan(2);

  const instance = new Base();
  instance.socket = t => {
    return {
      query: function(sql) {
        return Promise.resolve(sql);
      }
    };
  };
  const data = await instance.query('SELECT * FROM think_user');
  t.is(data, 'SELECT * FROM think_user');
  t.is(instance.lastSql, 'SELECT * FROM think_user');
});

ava.test('execute', async t => {
  t.plan(2);

  const instance = new Base();
  instance.socket = t => {
    return {
      execute: function(sql) {
        return Promise.resolve({
          insertId: 1000,
          affectedRows: 10
        });
      }
    };
  };
  const data = await instance.execute('DELETE FROM think_user');
  t.is(data, 10);
  t.is(instance.lastInsertId, 1000);
});

ava.test('execute, empty return', async t => {
  t.plan(2);

  const instance = new Base();
  instance.socket = t => {
    return {
      execute: function(sql) {
        return Promise.resolve({
        });
      }
    };
  };
  const data = await instance.execute('DELETE FROM think_user');
  t.is(data, 0);
  t.is(instance.lastInsertId, 0);
});

// ava.test('close', t => {
//   const instance = new Base({buffer_tostring: true});
//   let flag = false;
//   instance._socket = {
//     close: t => {
//       flag = true;
//     }
//   };
//   instance.close();
//   t.is(flag, true);
// });

// ava.test('close', t => {
//   const instance = new Base({buffer_tostring: true});
//   const flag = false;
//   instance.close();
//   t.is(flag, false);
// });

// ava.test('startTrans', async t => {
//   const instance = new Base();
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'START TRANSACTION');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.startTrans();
//   t.true(flag, true);
//   instance.transTimes = 1;
// });

// ava.test('startTrans, is started', async t => {
//   const instance = new Base();
//   instance.transTimes = 1;
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'START TRANSACTION');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.startTrans();
//   t.is(flag, false);
//   instance.transTimes = 1;
// });

// ava.test('commit, not start', async t => {
//   const instance = new Base();
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'ROLLBACK');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.commit();
//   t.false(flag);
//   instance.transTimes = 0;
// });

// ava.test('commit', async t => {
//   const instance = new Base();
//   instance.transTimes = 1;
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'COMMIT');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.commit();
//   t.true(flag);
//   instance.transTimes = 0;
// });

// ava.test('rollback, not start', async t => {
//   const instance = new Base();
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'ROLLBACK');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.rollback();
//   t.false(flag);
//   instance.transTimes = 0;
// });

// ava.test('rollback', async t => {
//   const instance = new Base();
//   instance.transTimes = 1;
//   let flag = false;
//   instance.execute = function(sql) {
//     t.is(sql, 'ROLLBACK');
//     flag = true;
//     return Promise.resolve();
//   };
//   const data = await instance.rollback();
//   t.true(flag);
//   instance.transTimes = 0;
// });
