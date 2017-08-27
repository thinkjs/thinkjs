/*
* @Author: lushijie
* @Date:   2017-08-23 16:05:05
* @Last Modified by:   lushijie
* @Last Modified time: 2017-08-27 11:22:35
*/
const path = require('path');
const sequelize = require('sequelize');
const Socket = require('./socket.js');
const {extendClassMethods} = require('./util.js');

const models = {};
const MODELS = Symbol('think-sequelize-models');

class Sequelize {
  constructor(modelName, config, name) {
    this.modelName = modelName;
    this.config = config;
    if (models[name]) return models[name];

    // connect
    const socket = Socket.getInstance(this.config);
    const sequelizeConn = socket.createConnection();

    let schema = this.schema;
    if (!schema.attributes) {
      schema = {
        attributes: schema,
        options: {}
      };
    }
    schema.options = Object.assign({}, this.config.schema, schema.options);
    this.schemaLast = schema;

    const model = sequelizeConn.define(this.tableName, schema.attributes, schema.options);
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
    let schemaLast = this.schemaLast;
    if(schemaLast.options.freezeTableName && schemaLast.options.tableName) return schemaLast.options.tableName;
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
  sequelize2(name) {
    const ModelClass = this.models[name] || Sequelize;
    const modelName = path.basename(name);
    const instance = new ModelClass(modelName, this.config, name);
    instance.models = this.models;
    return instance;
  }
}

module.exports = Sequelize;
