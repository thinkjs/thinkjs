const helper = require('think-helper');
const {Schema} = require('think-model-abstract');
const Debounce = require('think-debounce');

const debounce = new Debounce();

const SCHEMAS = {};

/**
 * mysql Schema
 */
module.exports = class MysqlSchema extends Schema {
  _getItemSchemaValidate(fieldData) {
    const validate = {};
    switch (fieldData.tinyType) {
      case 'tinyint':
        validate.int = {min: 0, max: 255};
        break;
      case 'smallint':
        validate.int = {min: fieldData.unsigned ? 0 : -32768, max: 32767};
        break;
      case 'int':
        validate.int = {min: fieldData.unsigned ? 0 : -2147483648, max: 2147483647};
        break;
      // case 'bigint':
      //   validate.int = {min: fieldData.unique ? 0 : -9223372036854775808, max: 9223372036854775807};
      //   break;
      case 'date':
        validate.date = true;
        break;
    };
    return validate;
  }
  _parseItemSchema(item) {
    item.type = item.type || 'varchar(100)';
    const pos = item.type.indexOf('(');
    item.tinyType = (pos === -1 ? item.type : item.type.slice(0, pos)).toLowerCase();
    if (item.default && !helper.isFunction(item.default) && item.tinyType.indexOf('int') > -1) {
      item.default = parseInt(item.default);
    }
    if (item.type.indexOf('unsigned') > -1) {
      item.unsigned = true;
      item.type = item.type.replace('unsigned', '').trim();
    }
    if (!item.validate) {
      item.validate = this._getItemSchemaValidate(item);
    }
    return item;
  }
  /**
   * get table schema
   * @param {String} table 
   */
  getSchema(table = this.table) {
    if (SCHEMAS[table]) return Promise.resolve(SCHEMAS[table]);
    return debounce.debounce(`getTable${table}Schema`, () => {
      const columnSql = `SHOW COLUMNS FROM ${this.parser.parseKey(table)}`;
      return this.query.query(columnSql).catch(() => []).then(data => {
        let ret = {};
        data.forEach(item => {
          ret[item.Field] = {
            name: item.Field,
            type: item.Type,
            required: item.Null === '',
            default: '',
            primary: item.Key === 'PRI',
            unique: item.Key === 'UNI',
            autoIncrement: item.Extra.toLowerCase() === 'auto_increment'
          };
        });
        ret = helper.extend(ret, this.schema);
        for (const key in ret) {
          ret[key] = this._parseItemSchema(ret[key]);
        }
        SCHEMAS[table] = ret;
        return ret;
      });
    });
  }
  /**
   * parse type
   * @param {String} tinyType 
   * @param {Mixed} value 
   */
  parseType(tinyType, value) {
    if (tinyType === 'enum' || tinyType === 'set' || tinyType === 'bigint') return value;
    if (tinyType.indexOf('int') > -1) return parseInt(value, 10) || 0;
    if (['double', 'float', 'decimal'].indexOf(tinyType) > -1) return parseFloat(value, 10) || 0;
    if (tinyType === 'bool') return value ? 1 : 0;
    return value;
  }
};
