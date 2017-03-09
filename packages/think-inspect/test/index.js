import test from 'ava';
import Inspector from '../index.js';
import mock from 'mock-require';

const THINK_PATH = 'think_path';
const APP_PATH = 'app_path';
const ROOT_PATH = 'root_path';
const pkgName = 'package.json';
const locale = 'locale';
const needVersion = ">=6.0.0";
const realNodeVersion = process.version;

test.beforeEach(t => {
  const fs = require('fs');
  const Helper = require('think-helper');
    fs.___readdirSync = fs.readdirSync;
    fs.___statSync = fs.statSync;
    Helper.___isFile = Helper.isFile;
    Helper.___isDirectory = Helper.isDirectory;
    Helper.___getdirFiles = Helper.getdirFiles;
});

function mockHelperIsFile(res) {
  const Helper = require('think-helper');
  Helper.isFile = function() {return res;};
}

function mockReadPkgEnginesFileSync(t) {
  const fs = require('fs');
  fs.readFileSync = function(pkgPath) {
    return JSON.stringify({
      "engines": {
        "node": needVersion
      }
    });
  };
}

function mockNodeVersion(nodeVersion) {
  Object.defineProperty(process, 'version', {  
    value: nodeVersion
  });
}

function testCheckNodeVersion(t, isFile, nodeVersion) {
  mockHelperIsFile(isFile);
  mockReadPkgEnginesFileSync(t);
  mockNodeVersion(nodeVersion);
  let checkNodeVersion_error = false;
  const logger = {
    error(msg) { 
      console.log(msg);
      checkNodeVersion_error = true;
    }
  };
   
  const inspector = new Inspector({
    THINK_PATH,
    APP_PATH,
    ROOT_PATH,
    logger: logger
  });
 
  inspector.checkNodeVersion();
  return checkNodeVersion_error;
}
test('checkNodeVersion when it meets the requirement of package.json', t => {
  const isFile = true;
  const nodeVersion = "v6.0.0";
  const checkNodeVersion_error = testCheckNodeVersion(t, isFile, nodeVersion);
  t.is(checkNodeVersion_error, false);
});

test('checkNodeVersion when it is lower than the requirement of package.json', t => {
  const isFile = true;
  const nodeVersion = "5.0.0";
  const checkNodeVersion_error = testCheckNodeVersion(t, isFile, nodeVersion);
  t.is(checkNodeVersion_error, true);
});

test('checkNodeVersion when package.json is not a file', t => {
  const isFile = false;
  const nodeVersion = "6.0.0";
  const checkNodeVersion_error = testCheckNodeVersion(t, isFile, nodeVersion);
  t.is(checkNodeVersion_error, false);
});

function mockHelperGetDirFiles() {
  const helper = require('think-helper');
  helper.getdirFiles = function() {
    return ['UPPER.js', 'a.js', 'b.css', 'c.html', 'd.tpl', '/locale/EN.js'];
  }
}
test('checkFileName', t => {
  let checkFileNameWran = false;
  const logger = {
    warn(msg) { 
      console.log(msg);
      checkFileNameWran = true;
    }
  };
  mockHelperGetDirFiles();
  const inspector = new Inspector({
    APP_PATH,
    locale,
    logger
  });
  inspector.checkFileName();
  t.is(checkFileNameWran, true);
});


function mockReadPkgDepSync(t) {
  const fs = require('fs');
  fs.readFileSync = function() {
    return JSON.stringify({
      "dependencies": {
        "dep1": "",
        "depNotExisted": "",
        "depIsDir": ""
      },
      "devDependencies": {
        "devDep1": "",
        "babel-runtime": ""
      }
    });
  };
}

function mockHelperIsDir() {
  const Helper = require('think-helper');
  Helper.isDirectory = function(filename) {
    if(filename.indexOf('depIsDir') > -1) {
      return true;
    }
  }
}

function mockRequire() {
  // Don't mock "depNotExisted"
  // and don't have a "depNotExisted" module in your project 
  // when you do the test :)
  mock("dep1", {___name: "dep1"});
  mock("devDep1", {___name: "devDep1"});
  mock("babel-runtime/helpers/inherits", {___name: "babel-runtime"});
}

function testCheckDependencies(t, isPkgFile, env) {
  let checkDependencies_error = false;
  const logger = {
    error(msg) { 
      console.log(msg);
      checkDependencies_error = true;
    }
  };
  mockHelperIsDir();
  mockHelperIsFile(isPkgFile);
  mockReadPkgDepSync(t);
  mockRequire();
  
  const inspector = new Inspector({
    env,
    ROOT_PATH,
    logger
  });

  inspector.checkDependencies();
  return checkDependencies_error;
}
test('checkDependencies when env is development', t => {
  const env = 'development';
  const isPkgFile = true;
  const checkDependencies_error = testCheckDependencies(t, isPkgFile, env);
  t.is(checkDependencies_error, true);
});
test('checkDependencies when env is production', t => {
  const env = 'production';
  const isPkgFile = true;
  const checkDependencies_error = testCheckDependencies(t, isPkgFile, env);
  t.is(checkDependencies_error, true);
});
test('checkDependencies when package.json is not file', t => {
  const env = 'production';
  const isPkgFile = false;
  const checkDependencies_error = testCheckDependencies(t, isPkgFile, env);
  t.is(checkDependencies_error, false);
});

test.afterEach.always(t => {
  const fs = require('fs');
  const Helper = require('think-helper');
  fs.readdirSync =fs.___readdirSync;
  fs.statSync = fs.___statSync;
  Helper.isFile = Helper.___isFile;
  Helper.isDirectory = Helper.___isDirectory;
  Helper.getdirFiles = Helper.___getdirFiles;
  Object.defineProperty(process, 'version', {  
    value: realNodeVersion
  });
});
