const helper = require('think-helper');
/**
 * abstract schema
 */
module.exports = class AbstractSchema {
  /**
   * constructor
   * @param {Object} config 
   * @param {Object} schema 
   * @param {String} table 
   */
  constructor(config, schema = {}, table) {
    this.config = config;
    this.schema = schema;
    this.table = table;
  }
  /**
   * get reverse fields
   * @param {String} fields 
   */
  getReverseFields(fields) {
    if (helper.isString(fields)) fields = fields.trim().split(/\s*,\s*/);
    return this.getSchema().then(schema => {
      const result = Object.keys(schema).filter(field => {
        return fields.indexOf(field) === -1;
      });
      // if has . in fields, add to result
      fields.forEach(item => {
        if (item.indexOf('.') > -1) result.push(item);
      });
      return result;
    });
  }
  /**
   * validate data
   * @param {Object} data 
   * @param {Object} schema 
   */
  validateData(data, schema) {
    return data;
  }
  /**
   * parse data
   * @param {Object} data 
   * @param {Boolean} isUpdate 
   */
  parseData(data, isUpdate = false, table) {
    return this.getSchema(table).then(schema => {
      const result = {};
      for (const key in schema) {
        if (isUpdate && schema[key].readonly) continue;
        // add default value
        if (data[key] === undefined) {
          const flag = !isUpdate || (isUpdate && schema[key].update);
          if (flag && schema[key].default !== '') {
            let defaultValue = schema[key].default;
            if (helper.isFunction(defaultValue)) {
              defaultValue = defaultValue(data);
            }
            result[key] = defaultValue;
          }
          continue;
        }
        if (helper.isNumber(data[key]) || helper.isString(data[key]) || helper.isBoolean(data[key])) {
          result[key] = this.parseType(schema[key].tinyType, data[key]);
        } else {
          result[key] = data[key];
        }
      }
      return this.validateData(result, schema);
    });
  }
};
