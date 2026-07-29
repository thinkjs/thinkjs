const test = require('ava');
const plugin = require('..');

function createApp(config) {
  return {
    think: {
      config(name, defaultValue, moduleName) {
        return config(name, defaultValue, moduleName);
      }
    }
  };
}

test('exposes knex extension on think, service, controller and context', t => {
  const app = createApp(() => ({type: 'mysql', mysql: {client: 'mysql'}}));
  const extensions = plugin(app);

  t.is(extensions.think.knex, extensions.service.knex);
  t.is(extensions.think.knex, extensions.controller.knex);
  t.is(extensions.think.knex, extensions.context.knex);
});

test('creates a knex instance from think config', t => {
  t.plan(3);
  const app = createApp((name, defaultValue, moduleName) => {
    t.is(name, 'knex');
    t.is(moduleName, 'common');
    return {type: 'mysql', mysql: {client: 'mysql'}};
  });

  const knex = plugin(app).think.knex();
  t.is(knex.client.config.client, 'mysql');
  knex.destroy();
});

test('uses custom module config when module name is passed', t => {
  t.plan(2);
  const app = createApp((name, defaultValue, moduleName) => {
    t.is(moduleName, 'admin');
    return {type: 'mysql', mysql: {client: 'mysql'}};
  });

  const knex = plugin(app).think.knex(undefined, 'admin');
  t.is(knex.client.config.client, 'mysql');
  knex.destroy();
});
