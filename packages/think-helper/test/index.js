import test from 'ava';
import {
  isFunction,
  isExist,
  isFile,
  isDirectory,
  extend, 
  promisify,
  defer,
  md5,
  mkdir,
  rmdir,
  chmod,
  uuid,
  datetime,
  escapeHtml,
  isEmpty,
  isNumberString,
  camelCase,
  getdirFiles,
  isTrueEmpty,
  isIP,
  timeout,
  parseAdapterConfig
} from '../index.js';
import fs from 'fs';


test('isExist', t => {
  t.is(isExist('/www/fasdfasfasdfa'), false)
})

test('isExist 2', t => {
  t.is(isExist(__filename), true)
})

test('isExist 3', t => {
  t.is(isExist(__dirname), true)
})

test('isExist 4', t => {
  t.is(isExist('/root'), false)
})

test('isFile', t => {
  t.is(isFile('/root'), false)
})

test('isFile 2', t => {
  t.is(isFile(__filename), true)
})

test('isDirectory', t => {
  t.is(isDirectory(__filename), false)
})

test('isDirectory 2', t => {
  t.is(isDirectory(__dirname), true)
})

test('extend 1', t => {
  let data = extend({}, {name: 'test'});
  t.deepEqual(data, {name: 'test'});
});

test('extend 2', t => {
  let data = extend({
    name: 'xd'
  }, {name: ['1', '2']});
  t.deepEqual(data, {name: ['1', '2']});
});

test('extend 3', t => {
  let data = extend({
    name: 'xd'
  }, {name: {value: '1'}});
  t.deepEqual(data, {name: {value: '1'}});
});

test('extend 4', t => {
  let data = extend({
    name: ['1']
  }, {name:['2']});
  t.deepEqual(data, {name: ['2']});
});


test('extend 5', t => {
  let data = extend({}, {name: 'welefen'}, {name: 'suredy'});
  t.deepEqual(data, {name: 'suredy'});
})

test('extend 6', t => {
  let data = extend({}, {name: 'welefen'}, {name2: 'suredy'});
  t.deepEqual(data, {name: 'welefen', name2: 'suredy'});
})

test('extend 7', t => {
  let data = extend(null, {name: 'welefen'}, {name2: 'suredy'});
  t.deepEqual(data, {name: 'welefen', name2: 'suredy'});
})

test('extend 8', t => {
  let data = extend({}, {name:[4,5]});
  t.deepEqual(data, {name:[4,5]});
})

test('extend 9', t => {
  let data = extend({},'',{name:'sgy'});
  t.deepEqual(data, {name:'sgy'});
})

test('extend 10', t => {
  let data = extend({name:'sgy'},{name:'sgy'});
  t.deepEqual(data, {name:'sgy'});
})



test('promisify', async (t) => {
  let fn = promisify(fs.readFile, fs);
  let data = await fn(__filename);
  t.is(data.length > 0, true);
})

test('promisify 2', async (t) => {
  let fn = promisify(fs.readFile, fs);
  let data = await fn(__filename + '/dddd').catch(() => false);
  t.is(data, false);
}) 

test('defer', t => {
  let deferred = defer();
  t.is(isFunction(deferred.promise.then), true)
}) 

test('md5', t => {
  t.is(md5(''), 'd41d8cd98f00b204e9800998ecf8427e')
})

test('mkdir', t => {
  mkdir('welefen22');
  t.is(isDirectory('welefen22'), true);
  fs.rmdirSync('welefen22')
})


test('mkdir 2', t => {
  mkdir('welefen/suredy/www');
  t.is(isDirectory('welefen/suredy/www'), true);
  fs.rmdirSync('welefen/suredy/www')
  fs.rmdirSync('welefen/suredy')
  fs.rmdirSync('welefen')
})

test('mkdir 3', t => {
  mkdir('welefen44/suredy/www');
  mkdir('welefen44/suredy/www');
  t.is(isDirectory('welefen44/suredy/www'), true);
  fs.rmdirSync('welefen44/suredy/www')
  fs.rmdirSync('welefen44/suredy')
  fs.rmdirSync('welefen44')
})

test('mkdir 4', async(t) => {
  mkdir('songguangyu78');
  t.is(mkdir('songguangyu78/smart','9527'), false);
  await rmdir('songguangyu78');
})

test('mkdir 5', async(t) => {
  t.is(mkdir('songguangyu79/smart','9527'), false);
  await rmdir('songguangyu79');
})


test('rmdir', async (t) => {
  mkdir('songguangyu75');
  t.is(isDirectory('songguangyu75'), true);
  await rmdir('songguangyu75');
  t.is(isDirectory('songguangyu75'), false);
})

test('rmdir 1', async (t) => {
  mkdir('songguangyu76');
  fs.writeFileSync('songguangyu76/abc.js', '123');
  mkdir('songguangyu76/xiaoming');
  t.is(isDirectory('songguangyu76'), true);
  await rmdir('songguangyu76');
  t.is(isDirectory('songguangyu76'), false);
})

test('rmdir 2', async (t) => {
  mkdir('songguangyu77');
  fs.rmdirSync('songguangyu77');
  chmod('songguangyu77');
  await rmdir('songguangyu77');
})

test('uuid', t => {
  var uuid1 = uuid('v1');
  t.is(uuid1.length > 1, true);
  var uuid2 = uuid();
  t.is(uuid2.length > 1, true);
})

test('datetime', t => {
  datetime();
  datetime('123');
})

test('datetime 1', t => {
  datetime('','YYYY-MM-DD');
  datetime('2017-12-12','YYYY-MM-DD');
})


test('escapeHtml', t => {
  t.deepEqual(escapeHtml('<div width=\'200\'></div>'), '&lt;div width=&#39;200&#39;&gt;&lt;/div&gt;');  
})
test('escapeHtml 1', t => {
  t.deepEqual(escapeHtml(('<div width="200"></div>')), '&lt;div width=&quote;200&quote;&gt;&lt;/div&gt;');  
})
test('isEmpty', t => {
  t.is(isEmpty({}), true);
  t.is(isEmpty(NaN), true);
  t.is(isEmpty(1), false);
  t.is(isEmpty('sgy'), false);
  t.is(isEmpty(false), true);
  t.is(isEmpty(null), true);
  t.is(isEmpty(undefined), true);
  t.is(isEmpty(''), true);
  t.is(isEmpty({'a': 1}), false);
  var date = new Date();
  t.is(isEmpty(date), false);
  var func = function() {}
  t.is(isEmpty(func), false);
  t.is(isEmpty([]), true);
  t.is(isEmpty(new Error('errror')), false);
  t.is(isEmpty(/test/), false);
})
test('isNumberString', t => {
  t.is(isNumberString(''), false);
  t.is(isNumberString('111d111'), false);
  t.is(isNumberString('111111'), true);
})

test('camelCase', t => {
  t.deepEqual(camelCase('index_test'), 'indexTest');
})

test('getdirFiles', t => {
  mkdir('songguangyu79');
  mkdir('songguangyu79/songguangyu80');
  fs.writeFileSync('songguangyu79/abc.js', '123');
  fs.writeFileSync('songguangyu79/songguangyu80/abc.js', '123');
  getdirFiles('songguangyu79');
  getdirFiles('songguangyu80');
  rmdir('songguangyu79');
})

test('isTrueEmpty', t => {
  t.deepEqual(isTrueEmpty(null), true);
})

test('chmod', t => {
  mkdir('songguangyu81');
  chmod('songguangyu81','0777');
  t.is(chmod('songguangyu82','0777'), false);
  rmdir('songguangyu81');
})

test('isIP', t => {
  t.deepEqual(isIP('127.0.0.1') === 4, true);
})

test('timeout', t => {
  timeout(1000).then(()=>{
    t.pass('success');
  })
})

test("parseAdapterConfig",t=>{
  let config = {
    type: 'nunjucks',
    common: {
      viewPath: 'thinkjs',
      extname: '.html',
      sep: '_' //seperator between controller and action
    },
    nunjucks: {
      handle: "nunjucks"
    },
    ejs: {
      handle: "ejs"
    }
  }
  let extConfig = "ejs";
  let extConfig2 = {
    handle: "ejs"
  };
  t.deepEqual(parseAdapterConfig(config).handle, "nunjucks");
  t.deepEqual(parseAdapterConfig(config, extConfig).handle, "ejs");
  t.deepEqual(parseAdapterConfig(config, extConfig2).handle, "ejs");
})