const Knex = require('knex');
const helper = require('think-helper');

module.exports = app => {
  function injectKnex(config, m = 'common') {
    const knexConfig = app.think.config('knex', undefined, m);
    config = helper.parseAdapterConfig(knexConfig, config);
    const instance = Knex(config);
    return instance;
  }
  const extend = {
    knex: injectKnex
  }
  return {
    think: extend,
    service: extend,
    controller: extend,
    context: extend
  };
};
