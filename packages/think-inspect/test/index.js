import test from 'ava';
import {
  checkNodeVersion,
  checkFileName,
  checkDependencies
} from '../index.js';

test('checkNodeVersion', t => {
  let n = 0;
  let result = checkNodeVersion({
    THINK_PATH: 'test/demo/checkNodeVersion'
  }, (errmsg, type)=> {
    n ++;
  });
  t.is(n, 0);
});
test('checkNodeVersion1', t => {
  let n = 0;
  let result = checkNodeVersion({
    THINK_PATH: 'test/demo/checkNodeVersion1'
  },  (errmsg, type) => {
    n ++;
  });
  t.is(n, 1);
});
test('checkNodeVersion2', t => {
  let n = 0;
   //not callback, return directly
  let result = checkNodeVersion({
    THINK_PATH: 'test/demo/checkNodeVersion2'
  },  (errmsg, type) => {
      n ++;
  });
  t.is(n, 0);
});


test('checkFileName', t => {
  checkFileName({
    APP_PATH: 'test/demo/checkFileName',
    sep: '/',
    locale: 'locale'
  }, (errmsg, type)=>{
    t.is(type, 'WARNING');
  });
});

test('checkDependencies', t => {
  let n = 0;
  checkDependencies({
    env: 'development',
    ROOT_PATH: 'test/demo/checkDependencies',
    sep: '/'
  }, (errmsg, type) => {
    n ++;
  });
  t.is(n, 0);
});
test('checkDependencies1', t => {
  let n = 0;
  //contains think-helper1 think-helper2 uninstalled
  checkDependencies({
    env: 'production',
    ROOT_PATH: 'test/demo/checkDependencies1',
    sep: '/'
  }, (errmsg, type) => {
    t.is(type, 'EXIT');
    n ++;
  });
   t.true(n >= 1);
});
test('checkDependencies2', t => {
  let n = 0;
  //package.json is directory, return directly
  checkDependencies({
    env: 'production',
    ROOT_PATH: 'test/demo/checkDependencies2',
    sep: '/'
  }, (errmsg, type) => {
    n ++;
  });
  t.is(n, 0);
});