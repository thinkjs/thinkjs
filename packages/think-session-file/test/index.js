import test from "ava";
import path from 'path';
import mock from 'mock-require';

let fileStoreData = {};
const sessionPath = '/session/absolute/path';
const fileList = ['lalaland', 'Sing', 'Zootopia', 'Kung fu panda'];
function mockRequire() {
  mockFileSystem();
  mockFileStore();
  return mock.reRequire('../index');
}
function mockFileStore() {
  class FileStore {
    constructor(path) {
      this.root = path;
    }
    get(key) {
      key = path.join(this.root, key);
      return new Promise((resolve, reject) => {
        resolve(fileStoreData[key] || {});
      });
    }
    set(key, val) {
      key = path.join(this.root, key);
      fileStoreData[key] = val;
    }
    delete(key) {
      key = path.join(this.root, key);
      delete fileStoreData[key];
    }
  }
  mock('think-store-file', FileStore);
}
function mockHelper() {
  var params = [];
  const helper = require('think-helper');
  helper.getdirFiles = function(dir) {
    params.push(dir);
    return fileList;
  }
  return params;
}
function maybeCallback(cb) {
  return typeof cb === 'function' ? cb : function() {
    throw new Error('callback is required')
  };
}
function mockFileSystem() {
  const fs = require('fs');
  fs.readFile = function(filePath, options, callback) {
    callback = maybeCallback(arguments[arguments.length -1]);
    const file = fileStoreData[filePath];
    if(fileStoreData.hasOwnProperty(filePath)) {
      callback(null, file);
    } else {
      callback('file not exists');
    }
  }
  fs.unlink = function(filePath, callback) {
    delete fileStoreData[filePath];
    callback(null, null);
  }
}

function sleep(dur) {
  dur = dur || 100;
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve();
    }, dur);
  });
}

test.beforeEach(t => {
  var fs = require('fs');
  fs.__readFile = fs.readFile;
  fs.__unlink = fs.unlink;
});

test.serial('1. set and get session data without maxAge', t => {
  const cookieName = fileList[0];
  return new Promise(async (resolve, reject) => {
    const options = {
      sessionPath: sessionPath,
      cookie: cookieName,
      gcInterval: 3600 * 1000
    }
    const param = mockHelper();
  
    const FileSession = mockRequire();
    const ctx = {
      res: {
        once: function(status, fn) {
          setTimeout(function() {
            fn();
          }, 10);
        }
      }
    }
    const fileSession = new FileSession(options, ctx);
    await fileSession.set('abc', '123');
    t.deepEqual(fileSession.data, {
      'abc': '123'
    });
   
    await sleep(100);
    const fileSession1 = new FileSession(options, ctx);
    const data = await fileSession1.get('abc');
    t.is(data, undefined);// session expired, so data is deleted;
    t.is(fileSession1.status, -1);
    
    const data1 = await fileSession1.get();
    t.deepEqual(data1, {});

   
    const fileSession2 = new FileSession(options, ctx);
    fileSession2.delete();
    fileSession2.get('abc');//just for covering line 45

    fileSession1.gc();
    t.deepEqual(param, [sessionPath]);
    resolve();
  });
});

test.serial('2. set and get session data with maxAge', t => {
  const cookieName = fileList[1];
  return new Promise(async (resolve, reject) => {
    const options = {
      sessionPath: sessionPath,
      cookie: cookieName,
      maxAge: '1d',
      gcInterval: 3600 * 1000
    }
    const param = mockHelper();
  
    const FileSession = mockRequire();
    const ctx = {
      res: {
        once: function(status, fn) {
          setTimeout(function() {
            fn();
          }, 10);
        }
      }
    }
    const fileSession = new FileSession(options, ctx);
    await fileSession.set('abc', '123');
    t.deepEqual(fileSession.data, {
      'abc': '123'
    });
   
    await sleep(100);
    const fileSession1 = new FileSession(options, ctx);
    const data = await fileSession1.get('abc');
    t.is(data, '123');// Session data is still accessible.

    t.is(fileSession1.status, 0);
   
    fileSession1.gc();
    t.deepEqual(param, [sessionPath]);
    resolve();
  });
});
test.serial('3. set and get session data 2', t => {
  const cookieName = fileList[2];
  return new Promise(async (resolve, reject) => {
    const options = {
      sessionPath: sessionPath,
      cookie: cookieName,
      gcInterval: 3600 * 1000
    }
    const param = mockHelper();
  
    const FileSession = mockRequire();
    const ctx = {
      res: {
        once: function(status, fn) {
          setTimeout(function() {
            fn();
          }, 10);
        }
      }
    }
    const fileSession = new FileSession(options, ctx);
    await fileSession.set('abc', '123');
    t.deepEqual(fileSession.data, {
      'abc': '123'
    });
   
    await sleep(100);
    const fileSession1 = new FileSession(options, ctx);
    const data = await fileSession1.get('abc');
    t.is(data, undefined);// Session data is still accessible.

    t.is(fileSession1.status, -1);
   
   
    resolve();
  });
});
test.serial('4. set and gc when content empty', t => {
  const cookieName = fileList[3];
  return new Promise(async (resolve, reject) => {
    const options = {
      sessionPath: sessionPath,
      cookie: cookieName,
      maxAge: 3600 * 1000,
      gcInterval: 3600 * 1000
    }
    const param = mockHelper();
  
    const FileSession = mockRequire();
    const ctx = {
      res: {
        once: function(status, fn) {
          setTimeout(function() {
            fn();
          }, 10);
        }
      }
    }
    fileStoreData[path.join(sessionPath, cookieName)] = '{}';
    const fileSession = new FileSession(options, ctx);
    await fileSession.set('abc', '123');
    t.deepEqual(fileSession.data, {
      'abc': '123'
    });
   
    await sleep(100);
    fileStoreData[path.join(sessionPath, cookieName)] = '';
    fileSession.gc();

    //when content.data is undefined
    fileStoreData[path.join(sessionPath, cookieName)] = JSON.stringify({
      expires: Date.now() + 3600 * 1000
    });
    const fileSession1 = new FileSession(options, ctx);
    await fileSession1.get('abc');
    t.deepEqual(fileSession1.data, {});

    resolve();
  });
});
test.afterEach(t => {
  var fs = require('fs');
  fs.readFile = fs.__readFile;
  fs.unlink = fs.__unlink;
});