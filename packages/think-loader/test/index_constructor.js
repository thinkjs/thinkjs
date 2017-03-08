const test = require('ava');
const Loader = require('../index.js');

test.beforeEach(t => {
    const fs = require('fs');
    fs.___readdirSync = fs.readdirSync;
    fs.___statSync = fs.statSync;
    // This runs after each test and other test hooks, even if they failed
});

function mockFs(t, isCommonConfigDirectory) {

  const helper = require('think-helper');
  const path = require('path');
  helper.isDirectory = function(p) {
    t.is(p, path.join('appPath', 'common/config'));
    return isCommonConfigDirectory;
  }

  // mock fs
  const fs = require('fs');
  fs.readdirSync= function(p){
    t.is(p, 'appPath');
    return ['user', 'admin', 'other'];
  };
  fs.statSync = function(p) {
    return {
      isDirectory() {
        if(path.join('appPath', 'user') === p) {
          return true;
        }
        return false;
      }
    }
  }
}

function createLoader() {
  return new Loader('appPath', 'thinkPath');
}

test('Loader constructor properly set paths', t => {
  mockFs(t, false);
  var loader = createLoader();
  t.is(loader.appPath, 'appPath');
  t.is(loader.thinkPath, 'thinkPath');
});

function testIsMultiModule(isCommonConfigDirectory, modules) {
  return t=>{
    mockFs(t, isCommonConfigDirectory);
    var loader = createLoader();
    t.deepEqual(loader.modules, modules);
  }
}
test('loader set modules "true" when "appPath/common/config" is dir', testIsMultiModule(true, ['user']));
test('loader set modules when "appPath/common/config" is not dir', testIsMultiModule(false, []));


test.afterEach.always(t => {
  const fs = require('fs');
  fs.readdirSync =fs.___readdirSync;
  fs.statSync = fs.___statSync;
});
