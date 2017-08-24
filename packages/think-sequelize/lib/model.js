/*
* @Author: lushijie
* @Date:   2017-08-23 16:05:05
* @Last Modified by:   lushijie
* @Last Modified time: 2017-08-24 15:32:20
*/
const Socket = require('./socket.js');
const {extendClassMethods} = require('./util.js');
const models = {};

class Sequelize {
  constructor(modelName, config, name) {
    this.modelName = modelName;
    this.config = config;
    if (models[name]) return models[name];
    let schema = this.schema;
    let sequelizeConn = new Socket(this.config).createConnection();
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
    return this.tablePrefix + this.modelName;
  }
}


module.exports = Sequelize;
