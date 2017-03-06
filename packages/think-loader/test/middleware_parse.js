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

function getParse() {
  return require('../loader/middleware_parse');
}

test.beforeEach(t => {
  mockAssert();
});

test('middleware of type string', t=>{
  const parse = getParse();

  const handle = ()=>{};
  var result = parse(['handler'], {handler(){
    return handle;
  }});

  t.is(result[0].handle, handle);
});

test('assert middleware is a function', t=>{
  var assertCallParams = mockAssert();
  const parse = getParse();

  const handle = ()=>{};
  t.throws(()=>{
    parse(['handler'], {handler: {}});
  }, Error)

  t.deepEqual(assertCallParams, [false, 'handle must be a function']);
});

test('assert middleware must return a function', t=>{
  var assertCallParams = mockAssert();
  const parse = getParse();

  const handle = ()=>{};
  parse(['handler'], {handler:
    ()=>{}});
  t.deepEqual(assertCallParams, [true, 'handle must be a function', false, 'handle must return a function']);
});

test('middleware of type array', t=>{
  const parse = getParse();

  const handle = ()=>{};
  var result = parse([
    ['handler', 'options', 'enable', 'match', 'ignore']
  ], {handler(){
    return handle;
  }});

  t.deepEqual(result, [{
    handle: handle,
    options: 'options',
    enable: 'enable',
    match: 'match',
    ignore: 'ignore'
  }]);

  result = parse([
    ['handler1', 'options', 'enable'],
    ['handler2', 'options']
  ], {
    handler1(){
      return handle;
    },
    handler2() {
      return handle;
    }
  });

  t.deepEqual(result, [{
    handle: handle,
    options: 'options',
    enable: 'enable'
  }, {
    handle: handle,
    options: 'options'
  }]);
});

test('middleware will be filter when !!enable is false', t=>{
  const parse = getParse();

  const handle = ()=>{};
  const result = parse([
    ['handler1', 'options', false], // filterd
    ['handler1', 'options not filter1'],  // not filter
    {
      handle: 'handler2',
      options: 'options not filter2'  // not filter
    },
    {
      handle: 'handler2',
      options: 'options not filter2',
      enable: false, // filter
      match: 'match',
      ignore: 'ignore'
    }
  ], {
    handler1(){
      return handle;
    },
    handler2() {
      return handle;
    }
  });

  t.deepEqual(result, [{
    handle: handle,
    options: 'options not filter1'
  }, {
    handle: handle,
    options: 'options not filter2',
  }]);
});

test('middleware of type obj', t=>{
  const parse = getParse();

  const handle = ()=>{};
  var result = parse([
    {
      handle: 'handler',
      options: 'options',
      enable: 'enable',
      match: 'match',
      ignore: 'ignore'
    }
  ], {handler(){
    return handle;
  }});

  t.deepEqual(result, [{
    handle: handle,
    options: 'options',
    enable: 'enable',
    match: 'match',
    ignore: 'ignore'
  }]);
});