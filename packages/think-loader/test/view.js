const helper = require('think-helper');
const test = require('ava');

test('load view ', t=>{
  helper.getdirFiles = function(a) {
    t.is(a, 'viewPath');
    return 'result';
  }

  const loadView = require('../loader/view').load;
  const result = loadView('viewPath');
  t.is(result, 'result');
});