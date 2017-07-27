const helper = require('think-helper');
const path = require('path');
const Model = require('./lib/model.js');

module.exports = app => {
  const model = function(name, config, m = 'common') {
    const models = app.modules.length ? (app.models[m] || {}) : app.models;
    const Cls = models[name] || Model;
    const modelName = path.basename(name);
    const instance = new Cls(modelName, config);
    // add models in config, it's need in model when get relation model instance
    instance.models = models;
    return instance;
  };

  return {
    think: {
      Mongo: Model,
      mongo(name, config, m) {
        const modelConfig = app.think.config('model', undefined, m);
        config = helper.parseAdapterConfig(modelConfig, config);
        return model(name, config, m);
      }
    },
    controller: {
      mongo: function(name, config, m) {
        return this.ctx.model(name, config, m);
      }
    },
    context: {
      mongo: function(name, config, m = this.module) {
        config = helper.parseAdapterConfig(this.config('model'), config);
        return model(name, config, m);
      }
    }
  };
};
