const test = require('ava');
const View = require('../lib/view');

class TestView extends View {
  constructor(ctx) {
    super(ctx);
    this.viewData = {};
  }
}

test('assign function -- both name and value are string type', t=> {
  const view = new TestView();
  view.assign('test', 'test');
  t.is(view.viewData['test'], 'test');
});

test('assign function -- string name with object value', t=> {
  const view = new TestView();
  const model = {
    id: 1,
    name: 'think',
    data: [
      {a: 1, b: 2},
      {a: 3, b: 4}
    ]
  };
  view.assign('test', model);
  t.deepEqual(view.viewData['test'], model);
});

test('assign function -- undefined name with string value', t=> {
  const view = new TestView();
  const originViewData = Object.assign(view.viewData, {});
  view.assign(undefined, 'test');
  t.deepEqual(originViewData, view.viewData);
});

test('assign function -- string name with undefined value', t=> {
  const view = new TestView();
  const assignStr = 'hello thinkjs';
  view.assign('test', assignStr);
  let value = view.assign('test');
  t.is(value, assignStr);
});

test('assign function -- object name with undefined value', t=> {
  const view = new TestView();
  view.viewData = {};
  let name = {
    id: 1,
    name: 'thinkjs',
    version: 3
  };
  view.assign(name);
  t.deepEqual(view.viewData, name);
});