/*
* @Author: lushijie
* @Date:   2017-08-23 09:44:20
* @Last Modified by:   lushijie
* @Last Modified time: 2017-08-29 16:49:23
*/
const helper = require('think-helper');
const path = require('path');
const Model = require('./lib/model.js');

module.exports = app => {
  function model(name, config, m = 'common') {
    const models = app.modules.length ? (app.models[m] || {}) : app.models;
    const Cls = models[name] || Model;
    const modelName = path.basename(name);
    const instance = new Cls(modelName, config, name);
    instance.models = models;

    //set relation
    let relations = instance.schemaOptions.relations;
    if(relations && helper.isObject(relations)) {
      relations = [relations];
    }
    if(relations) {
      relations.forEach((ele,index) => {
        let relationModelName = Object.keys(ele).filter(e => {
          return e !== 'options';
        })[0];

        let relationName = ele[relationModelName];
        let relationInstance = model(relationModelName, config, m = 'common');
        let relationOptions = Object.assign({}, ele.options);
        instance[relationName](relationInstance, relationOptions);
      });
    }

    return instance;
  };

  function injectModel(name, config, m) {
    const modelConfig = app.think.config('model', undefined, m);
    config = helper.parseAdapterConfig(modelConfig, config);
    return model(name, config, m);
  }

  return {
    think: {
      Sequel: Model,
      sequel: injectModel
    },
    service: {
      sequel: injectModel
    },
    controller: {
      sequel(name, config, m) {
        return this.ctx.sequel(name, config, m);
      }
    },
    context: {
      sequel(name, config, m = this.module) {
        config = helper.parseAdapterConfig(this.config('model'), config);
        return model(name, config, m);
      }
    }
  };
};
