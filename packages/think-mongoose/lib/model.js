const mongoose = require('mongoose');
const Socket = require('./socket.js');
const path = require('path');
const {extendClassMethods} = require('./util.js');

mongoose.Promise = global.Promise;

const MODELS = Symbol('think-mongoose-models');
const models = {};

class Mongoose {
  /**
   * 
   * @param {String} modelName 
   * @param {Object} config 
   * @param {String} name 
   */
  constructor(modelName, config, name) {
    this.modelName = modelName;
    this.config = config;

    if (models[name]) return models[name];

    const socket = Socket.getInstance(this.config);
    const connection = socket.createConnection();

    let schema = this.schema;
    if (!(schema instanceof mongoose.Schema)) {
      schema = new mongoose.Schema(schema);
    }
    const model = connection.model(this.tableName, schema);
    const Class = class extends model {};
    extendClassMethods(Class, this);
    models[name] = Class;
    return Class;
  }
  /**
   * get table prefix
   */
  get tablePrefix() {
    return this.config.prefix || '';
  }
  /**
   * get table name, with table prefix
   */
  get tableName() {
    return this.tablePrefix + this.modelName;
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
