const helper = require('think-helper');
const path = require('path');
const Model = require('./lib/model.js');

module.exports = app => {
  const getModels = function(m) {
    if (app.modules.length) {
      return helper.extend({}, app.models.common, app.models[m]);
    } else {
      return app.models;
    }
  };

  const model = function(name, config, m = 'common') {
    const models = getModels(m) || {};
    const Cls = models[name] || Model;
    const modelName = path.basename(name);
    const instance = new Cls(modelName, config);
    // add models in config, it's need in model when get relation model instance
    instance.models = getModels(m) || {};
    return instance;
  };

  return {
    think: {
      Model: Model,
      model(name, config, m) {
        config = helper.parseAdapterConfig(app.think.config('model', undefined, m), config);
        config.cache = helper.parseAdapterConfig(app.think.config('cache', undefined, m), config.cache);
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
