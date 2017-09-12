const helper = require('think-helper');
const path = require('path');
const {COMPARISON_LIST} = require('think-model-abstract');
const Model = require('./lib/model.js');

module.exports = app => {
  app.on('filterParam', data => {
    for (const name in data) {
      if (!helper.isArray(data[name])) continue;
      const first = data[name][0];
      if (!helper.isString(first)) continue;
      if (COMPARISON_LIST.indexOf(first.toUpperCase()) > -1) {
        data[name][0] += ' ';
      }
    }
  });
  function model(name, config, m = 'common') {
    const models = app.modules.length ? (app.models[m] || {}) : app.models;
    const Cls = models[name] || Model;
    const modelName = name ? path.basename(name) : name;
    const instance = new Cls(modelName, config);
    // add models in config, it's need in model when get relation model instance
    instance.models = models;
    return instance;
  };
  /**
   * inject model method
   * @param {String} name 
   * @param {Object} config 
   * @param {String} m 
   */
  function injectModel(name, config, m) {
    const modelConfig = app.think.config('model', undefined, m);
    const cacheConfig = app.think.config('cache', undefined, m);
    config = helper.parseAdapterConfig(modelConfig, config);
    const instance = model(name, config, m);
    instance._cacheConfig = cacheConfig;
    return instance;
  }

  return {
    think: {
      Model: Model,
      model: injectModel
    },
    service: {
      model: injectModel
    },
    controller: {
      model(name, config, m) {
        return this.ctx.model(name, config, m);
      }
    },
    context: {
      model(name, config, m = this.module) {
        config = helper.parseAdapterConfig(this.config('model'), config);
        const instance = model(name, config, m);
        // add adapter cache config
        instance._cacheConfig = this.config('cache');
        return instance;
      }
    }
  };
};
