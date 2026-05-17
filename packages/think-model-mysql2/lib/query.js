const { Query } = require('think-model-abstract');
const Mysql = require('think-mysql');
const helper = require('think-helper');
/**
 * mysql query
 */
module.exports = class MysqlQuery extends Query {
  select(options, cache) {
    if (!this.config.jsonFormat) {
      return super.select(options, cache);
    }

    return Promise.all([
      super.select(options, cache),
      this.schema.getSchema()
    ]).then(([data, schema]) => {
      const keys = Object.keys(schema).filter(key => schema[key].tinyType === 'json');
      (Array.isArray(data) ? data : [data]).forEach(row => {
        keys.filter(key => row[key] !== undefined && !helper.isArray(row[key]) && !helper.isObject(row[key])).forEach(key => {
          row[key] = JSON.parse(row[key]);
        });
      });
      return data;
    });
  }

  /**
     * get socket
     * @param {String|Object} sql
     */
  socket(sql) {
    return super.socket(sql, Mysql);
  }
  /**
         * execute sql
         */
  execute(sqlOptions, connection) {
    return super.execute(sqlOptions, connection).then(data => {
      if (data.insertId) {
        this.lastInsertId = data.insertId;
      }
      return data.affectedRows || 0;
    });
  }
};
