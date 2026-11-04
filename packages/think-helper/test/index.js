const {test} = require('node:test');
const {isInt, isFunction, isExist, isFile, isDirectory, extend, promisify, defer, md5, mkdir, rmdir, chmod, uuid, datetime, escapeHtml, isEmpty, isNumberString, camelCase, getdirFiles, isTrueEmpty, isIP, timeout, parseAdapterConfig, ms, snakeCase, isBuffer, omit} = require('../index.js');
const fs = require('fs');
const path = require('path');

test('isInt', t => {
  t.assert.strictEqual(isInt(42), true);
});

test('isInt1', t => {
  t.assert.strictEqual(isInt('42'), false);
});

test('isInt2', t => {
  t.assert.strictEqual(isInt(4e2), true);
});

test('isInt3', t => {
  t.assert.strictEqual(isInt('4e2'), false);
});

test('isInt4', t => {
  t.assert.strictEqual(isInt(' 1 '), false);
});

test('isInt5', t => {
  t.assert.strictEqual(isInt(''), false);
});

test('isInt6', t => {
  t.assert.strictEqual(isInt(' '), false);
});

test('isInt7', t => {
  t.assert.strictEqual(isInt('1a'), false);
});

test('isInt8', t => {
  t.assert.strictEqual(isInt('42e2a'), false);
});

test('isInt9', t => {
  t.assert.strictEqual(isInt(null), false);
});

test('isInt10', t => {
  t.assert.strictEqual(isInt(undefined), false);
});

test('isInt11', t => {
  t.assert.strictEqual(isInt(NaN), false);
});

test('isInt12', t => {
  t.assert.strictEqual(isInt(42.1), false);
});

test('isExist', t => {
  t.assert.strictEqual(isExist('/www/fasdfasfasdfa'), false);
});

test('isExist 2', t => {
  t.assert.strictEqual(isExist(__filename), true);
});

test('isExist 3', t => {
  t.assert.strictEqual(isExist(__dirname), true);
});

test('isExist 4', t => {
  t.assert.strictEqual(isExist('/root'), false);
});

test('isFile', t => {
  t.assert.strictEqual(isFile('/root'), false);
});

test('isFile 2', t => {
  t.assert.strictEqual(isFile(__filename), true);
});

test('isDirectory', t => {
  t.assert.strictEqual(isDirectory(__filename), false);
});

test('isDirectory 2', t => {
  t.assert.strictEqual(isDirectory(__dirname), true);
});

test('extend 1', t => {
  const data = extend({}, {name: 'test'});
  t.assert.deepStrictEqual(data, {name: 'test'});
});

test('extend 2', t => {
  const data = extend({
    name: 'xd'
  }, {name: ['1', '2']});
  t.assert.deepStrictEqual(data, {name: ['1', '2']});
});

test('extend 3', t => {
  const data = extend({
    name: 'xd'
  }, {name: {value: '1'}});
  t.assert.deepStrictEqual(data, {name: {value: '1'}});
});

test('extend 4', t => {
  const data = extend({
    name: ['1']
  }, {name: ['2']});
  t.assert.deepStrictEqual(data, {name: ['2']});
});

test('extend 5', t => {
  const data = extend({}, {name: 'welefen'}, {name: 'suredy'});
  t.assert.deepStrictEqual(data, {name: 'suredy'});
});

test('extend 6', t => {
  const data = extend({}, {name: 'welefen'}, {name2: 'suredy'});
  t.assert.deepStrictEqual(data, {name: 'welefen', name2: 'suredy'});
});

test('extend 7', t => {
  const data = extend(null, {name: 'welefen'}, {name2: 'suredy'});
  t.assert.deepStrictEqual(data, {name: 'welefen', name2: 'suredy'});
});

test('extend 8', t => {
  const data = extend({}, {name: [4, 5]});
  t.assert.deepStrictEqual(data, {name: [4, 5]});
});

test('extend 9', t => {
  const data = extend({}, '', {name: 'sgy'});
  t.assert.deepStrictEqual(data, {name: 'sgy'});
});

test('extend 10', t => {
  const data = extend({name: 'sgy'}, {name: 'sgy'});
  t.assert.deepStrictEqual(data, {name: 'sgy'});
});

// test('extend getter', t => {
//   let source = {
//     get a(){
//       return this.b();
//     },
//     b(){
//       return 1;
//     }
//   }
//   let data = extend({name:'sgy'}, source);
//   t.deepEqual(data.a, 1);
// })

// test('extend setter', t => {
//   let source = {
//     get a(){
//       return this.xxx;
//     },
//     set a(val){
//       this.xxx = val;
//     },
//     b(){
//       return 1;
//     }
//   }
//   let data = extend({name:'sgy'}, source);
//   data.a = 222;
//   t.deepEqual(data.a, 222);
//   t.deepEqual(data.xxx, 222)
// })

test('promisify', async(t) => {
  const fn = promisify(fs.readFile, fs);
  const data = await fn(__filename);
  t.assert.strictEqual(data.length > 0, true);
});

test('promisify 2', async(t) => {
  const fn = promisify(fs.readFile, fs);
  const data = await fn(path.join(__filename, 'dddd')).catch(() => false);
  t.assert.strictEqual(data, false);
});

test('defer', t => {
  const deferred = defer();
  t.assert.strictEqual(isFunction(deferred.promise.then), true);
});

test('md5', t => {
  t.assert.strictEqual(md5(''), 'd41d8cd98f00b204e9800998ecf8427e');
});

test('mkdir', t => {
  mkdir('welefen22');
  t.assert.strictEqual(isDirectory('welefen22'), true);
  fs.rmdirSync('welefen22');
});

test('mkdir 2', t => {
  mkdir('welefen/suredy/www');
  t.assert.strictEqual(isDirectory('welefen/suredy/www'), true);
  fs.rmdirSync('welefen/suredy/www');
  fs.rmdirSync('welefen/suredy');
  fs.rmdirSync('welefen');
});

test('mkdir 3', t => {
  mkdir('welefen44/suredy/www');
  mkdir('welefen44/suredy/www');
  t.assert.strictEqual(isDirectory('welefen44/suredy/www'), true);
  fs.rmdirSync('welefen44/suredy/www');
  fs.rmdirSync('welefen44/suredy');
  fs.rmdirSync('welefen44');
});

test('mkdir 4', async(t) => {
  mkdir('songguangyu78');
  t.assert.strictEqual(mkdir('songguangyu78/smart', '9527'), false);
  await rmdir('songguangyu78');
});

test('mkdir 5', async(t) => {
  t.assert.strictEqual(mkdir('songguangyu79/smart', '9527'), false);
  await rmdir('songguangyu79');
});

test('rmdir', async(t) => {
  mkdir('songguangyu75');
  t.assert.strictEqual(isDirectory('songguangyu75'), true);
  await rmdir('songguangyu75');
  t.assert.strictEqual(isDirectory('songguangyu75'), false);
});

test('rmdir 1', async(t) => {
  mkdir('songguangyu76');
  fs.writeFileSync('songguangyu76/abc.js', '123');
  mkdir('songguangyu76/xiaoming');
  t.assert.strictEqual(isDirectory('songguangyu76'), true);
  await rmdir('songguangyu76');
  t.assert.strictEqual(isDirectory('songguangyu76'), false);
});

test('rmdir 2', async(t) => {
  mkdir('songguangyu77');
  fs.rmdirSync('songguangyu77');
  chmod('songguangyu77');
  await rmdir('songguangyu77');
});

test('uuid', t => {
  const uuid1 = uuid('v1');
  t.assert.match(uuid1, /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

  const uuid2 = uuid();
  t.assert.match(uuid2, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('ms 1200', t => {
  var value = ms(1200);
  t.assert.strictEqual(value, 1200);
});
test('ms 2 days', t => {
  var value = ms('2 days');
  t.assert.strictEqual(value, 172800000);
});
test('ms 1d', t => {
  var value = ms('1d');
  t.assert.strictEqual(value, 86400000);
});
test('ms 10h', t => {
  var value = ms('10h');
  t.assert.strictEqual(value, 36000000);
});
test('ms 2.5 hrs', t => {
  var value = ms('2.5 hrs');
  t.assert.strictEqual(value, 9000000);
});
test('ms 1y', t => {
  var value = ms('1y');
  t.assert.strictEqual(value, 31557600000);
});
test('ms 1b', t => {
  try {
    const value = ms('1b');
    t.assert.strictEqual(1, value);
  } catch (e) {
    t.assert.strictEqual(e.toString(), "Error: think-ms('1b') result is undefined");
  }
});

test('datetime', t => {
  datetime();
  datetime('123');
});

test('datetime 1', t => {
  t.plan(4);
  const now = new Date();
  t.assert.strictEqual(datetime('2017-12-12 10:00:00', 'YYYY-MM-DD'), '2017-12-12');
  t.assert.strictEqual(datetime('', 'YYYY-MM-DD'), 'YYYY-aN-aN');
  t.assert.strictEqual(
    datetime(new Date('2017/10/10'), 'YYYY-MM-DD HH:mm:ss'),
    '2017-10-10 00:00:00'
  );
  t.assert.strictEqual(
    datetime('YYYY/MM/DD'),
    [
      now.getFullYear(),
      ('0' + (now.getMonth() + 1)).slice(-2),
      ('0' + now.getDate()).slice(-2)
    ].join('/')
  );
});

test('escapeHtml', t => {
  t.assert.deepStrictEqual(escapeHtml('<div width=\'200\'></div>'), '&lt;div width=&#39;200&#39;&gt;&lt;/div&gt;');
});
test('escapeHtml 1', t => {
  t.assert.deepStrictEqual(escapeHtml(('<div width="200"></div>')), '&lt;div width=&quot;200&quot;&gt;&lt;/div&gt;');
});
test('isEmpty', t => {
  t.assert.strictEqual(isEmpty({}), true);
  t.assert.strictEqual(isEmpty(NaN), true);
  t.assert.strictEqual(isEmpty(1), false);
  t.assert.strictEqual(isEmpty('sgy'), false);
  t.assert.strictEqual(isEmpty(false), true);
  t.assert.strictEqual(isEmpty(null), true);
  t.assert.strictEqual(isEmpty(undefined), true);
  t.assert.strictEqual(isEmpty(''), true);
  t.assert.strictEqual(isEmpty({'a': 1}), false);
  var date = new Date();
  t.assert.strictEqual(isEmpty(date), false);
  var func = function() {};
  t.assert.strictEqual(isEmpty(func), false);
  t.assert.strictEqual(isEmpty([]), true);
  t.assert.strictEqual(isEmpty(new Error('errror')), false);
  t.assert.strictEqual(isEmpty(/test/), false);
});
test('isNumberString', t => {
  t.assert.strictEqual(isNumberString(''), false);
  t.assert.strictEqual(isNumberString('111d111'), false);
  t.assert.strictEqual(isNumberString('111111'), true);
  t.assert.strictEqual(isNumberString('.1'), true);
  t.assert.strictEqual(isNumberString('.e1'), false);
  t.assert.strictEqual(isNumberString('.1e1'), true);
  t.assert.strictEqual(isNumberString('1.e1'), true);
  t.assert.strictEqual(isNumberString('e1'), false);
  t.assert.strictEqual(isNumberString('1e1'), true);
  t.assert.strictEqual(isNumberString('1.1e1'), true);
  t.assert.strictEqual(isNumberString('e1499451'), false);
  t.assert.strictEqual(isNumberString('149e9451'), true);
});

test('camelCase', t => {
  t.assert.deepStrictEqual(camelCase('index_test'), 'indexTest');
});

test('getdirFiles', t => {
  mkdir('songguangyu79');
  mkdir('songguangyu79/songguangyu80');
  fs.writeFileSync('songguangyu79/abc.js', '123');
  fs.writeFileSync('songguangyu79/songguangyu80/abc.js', '123');
  getdirFiles('songguangyu79');
  getdirFiles('songguangyu80');
  rmdir('songguangyu79');
});

test('isTrueEmpty', t => {
  t.assert.deepStrictEqual(isTrueEmpty(null), true);
});

test('chmod', t => {
  mkdir('songguangyu81');
  chmod('songguangyu81', '0777');
  t.assert.strictEqual(chmod('songguangyu82', '0777'), false);
  rmdir('songguangyu81');
});

test('isIP', t => {
  t.assert.deepStrictEqual(isIP('127.0.0.1') === 4, true);
});

test('timeout', t => {
  timeout(1000).then(() => {
    t.assert.ok(true, 'success');
  });
});

test('snakeCase', t => {
  var value = snakeCase('wwwTest');
  t.assert.deepStrictEqual(value, 'www_test');
});

test('isBuffer', t => {
  var value = isBuffer('wwwTest');
  t.assert.deepStrictEqual(value, false);
});

test('isBuffer 2', t => {
  var value = isBuffer(Buffer.from('test'));
  t.assert.deepStrictEqual(value, true);
});

test('parseAdapterConfig', t => {
  const config = {
    type: 'nunjucks',
    common: {
      viewPath: 'thinkjs',
      extname: '.html',
      sep: '_' // seperator between controller and action
    },
    nunjucks: {
      handle: 'nunjucks'
    },
    ejs: {
      handle: 'ejs'
    }
  };
  const extConfig = 'ejs';
  const extConfig2 = {
    handle: 'ejs'
  };
  t.assert.deepStrictEqual(parseAdapterConfig(config).handle, 'nunjucks');
  t.assert.deepStrictEqual(parseAdapterConfig(config, extConfig).handle, 'ejs');
  t.assert.deepStrictEqual(parseAdapterConfig(config, extConfig2).handle, 'ejs');
});

test('parseAdapterConfig 2', t => {
  const config = {
    type: 'nunjucks',
    common: {
      viewPath: 'thinkjs',
      extname: '.html',
      sep: '_' // seperator between controller and action
    },
    nunjucks: {
      handle: 'nunjucks'
    },
    ejs: {
      handle: 'ejs'
    }
  };
  // const extConfig = 'ejs';
  const extConfig2 = {
    type: 'ejs',
    handle: 'ejs'
  };
  t.assert.deepStrictEqual(parseAdapterConfig(config, extConfig2).type, 'ejs');
});

test('parseAdapterConfig 3', t => {
  const config = {
    type: 'nunjucks',
    common: {
      viewPath: 'thinkjs',
      extname: '.html',
      sep: '_' // seperator between controller and action
    },
    nunjucks: {
      handle: 'nunjucks'
    },
    ejs: {
      handle: 'ejs'
    }
  };
  // const extConfig = 'ejs';
  const extConfig2 = {
    type: 'ejs',
    handle: 'ejs'
  };
  const value = parseAdapterConfig(config);
  t.assert.deepStrictEqual(parseAdapterConfig(value, extConfig2).type, 'ejs');
});

test('parseAdapterConfig empty config', t => {
  const value = parseAdapterConfig({});
  t.assert.deepStrictEqual(parseAdapterConfig(value).type, '_');
});

test('parseAdapterConfig 4', t => {
  const value = parseAdapterConfig({handle: 'www', value: '222'});
  t.assert.deepStrictEqual(parseAdapterConfig(value).value, '222');
});

test('parseAdapterConfig 5', t => {
  const value = parseAdapterConfig({
    type: 'www',
    www: {
      handle: 'www', value: '222'
    },
    aaa: {
      value: 333
    }
  }, 'test', 'aaa');
  t.assert.deepStrictEqual(value.value, 333);
});

test('parseAdapterConfig 6', t => {
  const value = parseAdapterConfig({
    type: 'www',
    www: {
      handle: 'www', value: '222'
    },
    aaa: {
      value: 333
    }
  }, 'test', {timeout: 20});
  t.assert.deepStrictEqual(value.timeout, 20);
});

test('omit existing key', t => {
  const value = omit({
    a: 1,
    b: 2
  }, 'test');
  t.assert.deepStrictEqual(value, {a: 1, b: 2});
});

test('omit 1', t => {
  const value = omit({
    a: 1,
    b: 2
  }, 'a');
  t.assert.deepStrictEqual(value, {b: 2});
});

test('omit 2', t => {
  const value = omit({
    a: 1,
    b: 2
  }, 'a,b');
  t.assert.deepStrictEqual(value, {});
});

test('omit 3', t => {
  const value = omit({
    a: 1,
    b: 2
  }, ['a', 'b']);
  t.assert.deepStrictEqual(value, {});
});
