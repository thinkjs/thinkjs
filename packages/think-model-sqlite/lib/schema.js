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
      item.type = item.type.replace('unsigned', true).trim();
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
      table = this.parser.parseKey(table);
      const fieldsPromise = this.query.query(`PRAGMA table_info( ${table} )`);
      const indexesPromise = this.query.query(`PRAGMA INDEX_LIST( ${table} )`).then(list => {
        const indexes = {};
        const promises = list.map(item => {
          if (item.unique) return;
          return this.query.query(`PRAGMA index_info( ${item.name} )`).then(data => {
            data.forEach(item => {
              indexes[item.name] = {unique: true};
            });
          });
        });
        return Promise.all(promises).then(() => indexes);
      });
      return Promise.all([fieldsPromise, indexesPromise]).then(([fields, indexes]) => {
        let ret = {};
        fields.forEach(item => {
          item.unique = indexes[item.name] && indexes[item.name].unique;
          ret[item.name] = {
            name: item.name,
            type: item.type,
            required: !!item.notnull,
            default: '',
            primary: !!item.pk,
            unique: item.unique,
            autoIncrement: false
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
    if (tinyType.indexOf('int') > -1) return parseInt(value, 10);
    if (['double', 'float', 'decimal'].indexOf(tinyType) > -1) return parseFloat(value, 10);
    if (tinyType === 'bool') return value ? 1 : 0;
    return value;
  }
};
