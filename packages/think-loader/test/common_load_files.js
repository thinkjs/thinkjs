const test = require('ava');
const path = require('path');

const fileList = ['folder/b2.js', 'a.js', 'folder/b1.js', 'd.css', 'e.js.bs', 'folder\\folder2\\c.js'];

function mockHelper() {
  var params = [];
  const helper = require('think-helper');
  helper.getdirFiles = function(dir) {
    params.push(dir);
    return fileList;
  }
  return params;
}

function mockUtil() {
  var params = [];
  const util = require('../loader/util.js');
  util.interopRequire = function(p) {
    params.push(p);
    var length = params.length;
    return length;
  }
  return params;
}

test('common loadFiles will call getdirFiles, rename, repalce and sort', t=>{
  var params1 = mockHelper();
  var params2 = mockUtil();
  const common = require('../loader/common.js');

  var ret = common.loadFiles('dir');

  t.deepEqual(params1, ['dir']);

  t.deepEqual(params2, [
    path.join('dir', fileList[0]),
    path.join('dir', fileList[1]),
    path.join('dir', fileList[2]),
    path.join('dir', fileList[5])
  ]); // 4 match js files

  t.deepEqual(ret, {
    "folder/b2": 1,
    "a": 2,
    "folder/b1": 3,
    "folder/folder2/c": 4
  });
});
