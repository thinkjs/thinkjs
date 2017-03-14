const test = require('ava');
const mock = require('mock-require');

function createLoader(modules = 'modules') {
  let Loader = mock.reRequire('../../index.js');
  var loader = new Loader('apppath', 'thinkpath');
  loader.modules = modules;
  return loader;
}

function getRouter() {
  return require('../../loader/router.js');
}

test('formatRouter will call router function and return rules', t=>{
  var {formatRouter, Router} = getRouter();
  var router = function(p) {
    t.is(true, p instanceof Router);
    p.get('match', 'path')
  }
  var rules = formatRouter(router);
  t.deepEqual(rules, [{
    method: 'get',
    match: /^match(?:\/(?=$))?$/i,
    path: 'path',
    query: []
  }]);
});
