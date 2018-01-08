/*
* @Author: lushijie
* @Date:   2017-08-23 16:05:05
* @Last Modified by:   lushijie
* @Last Modified time: 2018-01-08 14:16:02
*/
const path = require('path');
const sequelize = require('sequelize');
const Socket = require('./socket.js');
const debug = require('debug')('think-sequelize');
const {extendClassMethods} = require('./util.js');
const MODELS = Symbol('think-sequelize-models');
const models = {};
const conns = {};

class Model {
  constructor(modelName, config, name) {
    this.modelName = modelName;
    this.config = config;
    if (models[name]) return models[name];

    // connect
    const socket = Socket.getInstance(this.config);
    const sequelizeConn = socket.createConnection();
    conns[modelName] = sequelizeConn;

    // schema
    let schema = this.schema || {};
    if(!schema.attributes) {
      schema = {
        attributes: schema,
        options: {},
        relations: []
      };
    }
    schema.options = Object.assign({}, schema.options);
    this.schemaOptions = schema;
    debug(`ModelName: ${modelName}, Schema: ${JSON.stringify(this.schemaOptions)}`);

    const model = sequelizeConn.define(this.modelName, schema.attributes, schema.options);

    // const Class = class extends model {}; // make relation name wrong
    this.modelClass = class extends model {};
    extendClassMethods(this.modelClass, this);
    models[name] = this.modelClass;

    // add instace methods
    if (this.instanceMethods) {
      Object.keys(this.instanceMethods).forEach(ele =>{
        // model.prototype[ele] = this.instanceMethods[ele]; // without using this for reuse
        this.modelClass.addInstanceMethod(this.instanceMethods[ele]);
      })
    }

    return this.modelClass;
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
    let schemaOptions = this.schemaOptions;
    if(schemaOptions.options.freezeTableName && schemaOptions.options.tableName) return schemaOptions.options.tableName;
    return this.tablePrefix + this.modelName;
  }

  /**
   * get model conntection
   */
  getConnection(modelName = this.modelName) {
    return conns[modelName] || {};
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
  sequel(name) {
    const ModelClass = this.models[name] || Model;
    const modelName = path.basename(name);
    const instance = new ModelClass(modelName, this.config, name);
    instance.models = this.models;
    return instance;
  }

  /**
   * add instance methods
   * @param {Function} fn [anonymous fn is disabled]
   */
  addInstanceMethod(fn) {
    this.prototype.__proto__[fn.name] = fn;
  }
}

Model.Sequel = sequelize;
Model.Relation = {
  HAS_ONE: 'hasOne',
  BELONG_TO: 'belongsTo',
  HAS_MANY: 'hasMany',
  MANY_TO_MANY: 'belongsToMany'
};
module.exports = Model;
