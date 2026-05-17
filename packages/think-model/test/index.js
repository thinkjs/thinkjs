const {test} = require('ava');
const events = require('events');
const Model = require('../index.js');

class App extends events {}

const app = new App();

test('filterParam 1', t => {
  const data = {
    name: ['EXP', 2]
  };
  Model(app);
  app.emit('filterParam', data);
  t.deepEqual(data, {name: ['EXP ', 2]});
});

test('filterParam 2', t => {
  const data = {
    name: ['EXP2', 2]
  };
  Model(app);
  app.emit('filterParam', data);
  t.deepEqual(data, {name: ['EXP2', 2]});
});


test('filterParam 3', t => {
  const data = {
    name: {EXP: 2}
  };
  Model(app);
  app.emit('filterParam', data);
  t.deepEqual(data, {name: {'EXP ': 2}});
});

test('filterParam 4', t => {
  const data = {
    name: {EXP2: 2}
  };
  Model(app);
  app.emit('filterParam', data);
  t.deepEqual(data, {name: {'EXP2': 2}});
});