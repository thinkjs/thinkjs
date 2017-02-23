import test from 'ava';
import Loader from '../index.js';

function createLoader() {
  return new Loader('apppath', 'thinkpath');
}

test('Loader constructor properly set paths', t => {
    var loader = createLoader();
    t.is(loader.appPath, 'apppath');
    t.is(loader.thinkPath, 'thinkpath');
});

function testIsMultiModule(isCommonConfigDirectory) {
  return t=>{
    const helper = require('think-helper');
    const path = require('path');
    helper.isDirectory = function(p) {
      t.is(p, path.join('apppath', 'common/config'));
      return isCommonConfigDirectory;
    }
    var loader = createLoader();
    t.is(loader.isMultiModule, isCommonConfigDirectory)
  }
}
test('loader set isMultiModule "true" when "appPath/common/config" is dir', testIsMultiModule(true));
test('loader set isMultiModule "false" when "appPath/common/config" is not dir', testIsMultiModule(false));