import test from 'ava';
import Loader from '../index.js';

function createLoader() {
  return new Loader('apppath', 'thinkpath');
}

test('loadConfig will pass the right params and return',t=>{
  const helper = require('think-helper');
  const config = require('../loader/config.js');
  helper.isDirectory = function(p) {
    return true;
  }
  config.load = function(a,b,c,d) {
    t.is(a, 'apppath');
    t.is(b, true);
    t.is(c, 'thinkpath');
    t.is(d, 'env');
    return 'config';
  }
  var loader = createLoader();
  t.is(loader.loadConfig('env'), 'config');
});


test('loadBootstrap will pass the right params and return',t=>{
  const helper = require('think-helper');
  const bootstrap = require('../loader/bootstrap.js');
  helper.isDirectory = function(p) {
    return true;
  }

  bootstrap.load = function(a,b) {
    t.is(a, 'apppath');
    t.is(b, true);
    return 'bootstrap';
  }
  var loader = createLoader();
  t.is(loader.loadBootstrap(), 'bootstrap');
});


function testCommon(method, name, para) {
  return t=>{
    const helper = require('think-helper');
    const controller = require('../loader/common.js');
    helper.isDirectory = function(p) {
      return true;
    }

    controller.load = function(a,b,c) {
      t.is(a, 'apppath');
      t.is(b, true);
      t.is(c, name)
      return name;
    }
    var loader = createLoader();
    if(para) {
      t.is(loader[method](para), name);
    } else {
      t.is(loader[method](), name);
    }

  }
}
test('loadController will pass the right params and return', testCommon('loadController', 'controller'));

test('loadLogic will pass the right params and return', testCommon('loadLogic', 'logic'));

test('loadModel will pass the right params and return', testCommon('loadModel', 'model'));

test('loadService will pass the right params and return', testCommon('loadService', 'service'));

test('loadCommon will pass the right params and return', testCommon('loadCommon', 'some name', 'some name'));

test('loadMiddleware will pass the right params and return',t=>{
  const helper = require('think-helper');
  const middleware = require('../loader/middleware.js');
  helper.isDirectory = function(p) {
    return true;
  }
  middleware.load = function(a,b,c) {
    t.is(a, 'apppath');
    t.is(b, true);
    t.is(c, 'thinkpath');
    return 'middleware';
  }
  var loader = createLoader();
  t.is(loader.loadMiddleware(), 'middleware');
});

test('loadRouter will pass the right params and return',t=>{
  const helper = require('think-helper');
  const router = require('../loader/router.js');
  helper.isDirectory = function(p) {
    return false;
  }

  router.load = function(a,b) {
    t.is(a, 'apppath');
    t.is(b, false);
    return 'router';
  }
  var loader = createLoader();
  t.is(loader.loadRouter(), 'router');
});

test('loadView will pass the right params and return',t=>{
  const helper = require('think-helper');
  const view = require('../loader/view.js');
  helper.isDirectory = function(p) {
    return false;
  }

  view.load = function(v) {
    t.is(v, 'viewpath');
    return 'this is view';
  }
  var loader = createLoader();
  t.is(loader.loadView('viewpath'), 'this is view');
});