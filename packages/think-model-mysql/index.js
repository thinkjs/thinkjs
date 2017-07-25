const Abstract = require('think-model-abstract');
const Query = require('./lib/query.js');
const Schema = require('./lib/schema.js');

const QUERY = Symbol('think-model-query');
const SCHEMA = Symbol('think-model-schema');

module.exports = class Mysql extends Abstract {
  /**
   * get query instance
   */
  get query() {
    if (this[QUERY]) return this[QUERY];
    this[QUERY] = new Query(this.model.config);
    return this[QUERY];
  }
  /**
   * get schema instance
   */
  get schema() {
    if (this[SCHEMA]) return this[SCHEMA];
    this[SCHEMA] = new Schema(this.model.config, this.model.schema, this.model.tableName);
    return this[SCHEMA];
  }
};
