const test = require('ava');

var assertCallParams;
function mockAssert() {
  if(!assertCallParams) {
    const mock = require('mock-require');
    assertCallParams = [];
    mock('assert', (type, desc)=>{
      assertCallParams.push(type, desc);
    });
  } else {
    assertCallParams.length = 0;
  }
  return assertCallParams;
}

function getFormatAdapter() {
  return require('../loader/config_format_adapter');
}

test('formatAdapter will assert adapter config must have type field', t=>{
  var assertCallParams = mockAssert();
  var formatAdapter = getFormatAdapter();
  formatAdapter({
    name1: {type: 'I have a type'},
    name2: {/*I don't have a type*/}
  });
  t.is(assertCallParams[0], 'I have a type');
  t.is(assertCallParams[2], undefined);
  t.is(assertCallParams[3], `adapter.name1 must be an object`);
});

test('formatAdapter will assert common field be an object', t=>{
  var assertCallParams = mockAssert();
  var formatAdapter = getFormatAdapter();
  formatAdapter({
    name1: {type: 'I have a type', common: true}
  });
  t.is(assertCallParams[2], false);
  t.is(assertCallParams[3], 'adapter.name1.common must be an object');
});

test('formatAdapter will return the same instance if pass {}', t=>{
  var config = {};
  var formatConfig = getFormatAdapter()(config);
  t.is(config, formatConfig);
});

test('formatAdapter will merge common field to item,(also will ignore type field)', t=>{

  var config={
    db: {
      type: 'xxx', // will be the same
      common: { // at last common will be deleted
        a: 1,
        d: 33
      },
      xxx: {
        handle: 'xxx',
        a: 2, // a = 2, b = 3, d = 33
        b: 3
      },
      yyy: {
        handle: 'yyy',
        b: 4, // a = 1, b = 4, d = 33
      }
    },
    session: {
      type: 'yyy',
      common: {
        a: 1,
        d: 33
      },
      xxx: {
        handle: 'xxx',
      },
      yyy: {
        handle: 'yyy'
        a: 2
      }
    }
  };

  var adapter = {
    db: {
      xxx: function() {},
      yyy: function() {}
    },
    session: {
      xxx: function() {},
      yyy: function() {},
    }
  };
  var formatConfig = getFormatAdapter();
  var fc = formatConfig(config);

  t.is(fc.db.type, 'xxx');
  t.is(fc.session.type, 'session');

  t.is(fc.db.common, undefined);
  t.is(fc.session.common, undefined);

  var {db, session} = fc;

  t.deepEqual(db.xxx, {a:2, b:3, d:33});
  t.deepEqual(db.yyy, {a:1, b:4, d:33});

  t.deepEqual(session.xxx, {a:1, d:33});
  t.deepEqual(session.yyy, {a:2, d:33});
});
