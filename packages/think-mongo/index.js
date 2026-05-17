const helper = require('think-helper');
const path = require('path');
const Model = require('./lib/model.js');

module.exports = app => {
  function model(name, config, m = 'common') {
    const models = app.modules.length ? (app.models[m] || {}) : app.models;
    const Cls = models[name] || Model;
    const modelName = path.basename(name);
    const instance = new Cls(modelName, config);
    // add models in config, it's need in model when get relation model instance
    instance.models = models;
    return instance;
  };

  function injectModel(name, config, m) {
    const modelConfig = app.think.config('model', undefined, m);
    config = helper.parseAdapterConfig(modelConfig, config);
    return model(name, config, m);
  }

  return {
    think: {
      Mongo: Model,
      mongo: injectModel
    },
    service: {
      mongo: injectModel
    },
    controller: {
      mongo(name, config, m) {
        return this.ctx.mongo(name, config, m);
      }
    },
    context: {
      mongo(name, config, m = this.module) {
        config = helper.parseAdapterConfig(this.config('model'), config);
        return model(name, config, m);
      }
    }
  };
};
