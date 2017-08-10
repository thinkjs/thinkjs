const Abstract = require('think-model-abstract');
const Query = require('./lib/query.js');
const Schema = require('./lib/schema.js');
const Parser = require('./lib/parser.js');

const QUERY = Symbol('think-model-query');
const SCHEMA = Symbol('think-model-schema');
const PARSER = Symbol('think-model-parser');

module.exports = class Mysql extends Abstract {
  /**
   * get parser instance
   */
  get parser() {
    if (this[PARSER]) return this[PARSER];
    this[PARSER] = new Parser(this.model.config);
    return this[PARSER];
  }
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
