const mongoose = require('mongoose');
const Scoket = require('./socket.js');
const path = require('path');
const {extendClassMethods} = require('./util.js');

mongoose.Promise = global.Promise;

const MODELS = Symbol('think-mongoose-models');
const models = {};

class Mongoose {
  constructor(modelName, config, name) {
    this.modelName = modelName;
    this.config = config;

    if (models[name]) return models[name];

    const socket = Scoket.getInstance(this.config);
    socket.createConnection();

    let schema = this.schema;
    if (!(schema instanceof mongoose.Schema)) {
      schema = new mongoose.Schema(schema);
    }
    const model = mongoose.model(modelName, schema);
    const Class = class extends model {};
    extendClassMethods(Class, this);
    models[name] = Class;
    return Class;
  }
  /**
   * get all store models
   */
  get models() {
    return this[MODELS] || {};
  }
  /**
   * set models
   */
  set models(value) {
    this[MODELS] = value;
  }
  /**
   * get model instance
   * @param {String} name 
   */
  mongoose(name) {
    const ModelClass = this.models[name] || Mongoose;
    const modelName = path.basename(name);
    const instance = new ModelClass(modelName, this.config, name);
    instance.models = this.models;
    return instance;
  }
}

Mongoose.mongoose = mongoose;
Mongoose.Schema = mongoose.Schema;
Mongoose.Mixed = mongoose.Schema.Types.ObjectId;
Mongoose.ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = Mongoose;
