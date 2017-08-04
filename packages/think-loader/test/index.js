const test = require('ava');
const mock = require('mock-require');

function createLoader(modules = 'modules') {
  const Loader = mock.reRequire('../index.js');
  var loader = new Loader('apppath', 'thinkpath');
  loader.modules = modules;
  return loader;
}

test('loadConfig will pass the right params and return', t => {
  mock('../loader/config.js', class config {
    load(a, b, c, d) {
      t.is(a, 'apppath');
      t.is(b, 'thinkpath');
      t.is(c, 'env');
      t.is(d, 'modules');
      return 'config';
    }
  });

  var loader = createLoader();
  t.is(loader.loadConfig('env'), 'config');
});

test('loadBootstrap will pass the right params and return', t => {
  mock('../loader/bootstrap', function(a, b) {
    t.is(a, 'apppath');
    t.is(b, 'modules');
    return 'bootstrap';
  });
  var loader = createLoader();
  t.is(loader.loadBootstrap(), 'bootstrap');
});

function testCommon(method, name, para) {
  return t => {
    mock('../loader/common.js', {
      load(a, b, c) {
        t.is(a, 'apppath');
        t.is(b, name);
        t.is(c, 'modules');
        return name;
      }
    });
    var loader = createLoader();
    if (para) {
      t.is(loader[method](para), name);
    } else {
      t.is(loader[method](), name);
    }
  };
}
test('loadController will pass the right params and return', testCommon('loadController', 'controller'));

test('loadLogic will pass the right params and return', testCommon('loadLogic', 'logic'));

test('loadModel will pass the right params and return', testCommon('loadModel', 'model'));

test('loadService will pass the right params and return', testCommon('loadService', 'service'));

test('loadCommon will pass the right params and return', testCommon('loadCommon', 'some name', 'some name'));

test('loadMiddleware will pass the right params and return', t => {
  mock('../loader/middleware.js', class middleware {
    load(a, b, c, d) {
      t.is(a, 'apppath');
      t.is(b, 'thinkpath');
      t.is(c, 'modules');
      t.is(d, 'app');
      return 'middleware';
    }
  });
  var loader = createLoader();
  t.is(loader.loadMiddleware('app'), 'middleware');
});

test('loadRouter will pass the right params and return', t => {
  mock('../loader/router.js', {load: function(a, b) {
    t.is(a, 'apppath');
    t.is(b, 'modules');
    return 'router';
  }
  });
  var loader = createLoader();
  t.is(loader.loadRouter(), 'router');
});
