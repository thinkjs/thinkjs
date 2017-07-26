const helper = require('think-helper');
const path = require('path');
const Model = require('./lib/model.js');

module.exports = app => {
  const model = function(name, config, m = 'common') {
    const models = app.models.length ? (app.models[m] || {}) : app.models;
    const Cls = models[name] || Model;
    const modelName = path.basename(name);
    const instance = new Cls(modelName, config);
    // add models in config, it's need in model when get relation model instance
    instance.models = models;
    return instance;
  };

  return {
    think: {
      Model: Model,
      model(name, config, m) {
        const modelConfig = app.think.config('model', undefined, m);
        const cacheConfig = app.think.config('cache', undefined, m);
        config = helper.parseAdapterConfig(modelConfig, config);
        config.cache = helper.parseAdapterConfig(cacheConfig, config.cache);
        return model(name, config, m);
      }
    },
    controller: {
      model: function(name, config, m) {
        return this.ctx.model(name, config, m);
      }
    },
    context: {
      model: function(name, config, m = this.module) {
        config = helper.parseAdapterConfig(this.config('model'), config);
        // add adapter cache config
        config.cache = helper.parseAdapterConfig(this.config('cache'), config.cache);
        return model(name, config, m);
      }
    }
  };
};
