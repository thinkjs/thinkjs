const test = require('ava');
const mock = require('mock-require');

function createLoader(modules = 'modules') {
  let Loader = mock.reRequire('../../index.js');
  var loader = new Loader('apppath', 'thinkpath');
  loader.modules = modules;
  return loader;
}

function getRouter() {
  return require('../../loader/router.js').Router;
}

const methods = [
  'get',
  'post',
  'put',
  'head',
  'delete',
  'options',
  'trace',
  'copy',
  'lock',
  'mkcol',
  'move',
  'purge',
  'propfind',
  'proppatch',
  'unlock',
  'report',
  'mkactivity',
  'checkout',
  'merge',
  'm-search',
  'notify',
  'subscribe',
  'unsubscribe',
  'patch',
  'search',
  'connect',
  'verb',
  'redirect',
  'resource',
  'del'
];

test('Router object methods', t=>{
  const Router = getRouter();

  var instance = new Router();

  var expectRules = [];

  methods.forEach((m, i)=>{

    instance[m]('match', 'path');
    if(['verb', 'redirect', 'resource', 'del'].indexOf(m) === -1) {
      expectRules.push({match: 'match', method: m, path: 'path'});
    }
  })
  expectRules.push({match: 'match', path: 'path'});
  expectRules.push({method: 'redirect', statusCode: 302, match: 'match', path: 'path'});
  expectRules.push({method: 'resource', match: 'match', path: 'path'});
  expectRules.push({method: 'delete', match: 'match', path: 'path'});
  t.deepEqual(instance.rules, expectRules);
});

test('Router object call will return this', t=>{
  const Router = getRouter();
  var instance = new Router();

  methods.forEach((m, i)=>{
    t.is(instance[m](), instance);
  });

});

test('Router call redirect can pass statusCode', t=>{
  const Router = getRouter();
  var instance = new Router();
  instance.redirect('match', 'path', 200);
  t.deepEqual(instance.rules, [{method: 'redirect', match: 'match', path: 'path', statusCode: 200}]);
});