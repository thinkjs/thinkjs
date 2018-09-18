const helper = require('think-helper');
const { Schema } = require('think-model-abstract');
const Debounce = require('think-debounce');

const debounce = new Debounce();
const SCHEMAS = {};

/**
 * PostgreSQL Schema
 */
module.exports = class PostgreSQLSchema extends Schema {
  _getItemSchemaValidate(fieldData) {
    const validate = {};
    switch (fieldData.tinyType) {
      case 'tinyint':
        validate.int = { min: 0, max: 255 };
        break;
      case 'smallint':
        validate.int = { min: fieldData.unsigned ? 0 : -32768, max: 32767 };
        break;
      case 'int':
        validate.int = { min: fieldData.unsigned ? 0 : -2147483648, max: 2147483647 };
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
      const columnSql = `SELECT column_name,is_nullable,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='${table}'`;
      const indexSql = `SELECT indexname,indexdef FROM pg_indexes WHERE tablename='${table}'`;
      const columnPromise = this.query.query(columnSql).catch(() => []);
      const indexPromise = this.query.query(indexSql).catch(() => []);
      return Promise.all([columnPromise, indexPromise]).then(([columns, indexs]) => {
        let ret = {};
        columns.forEach(item => {
          ret[item.column_name] = {
            name: item.column_name,
            type: item.data_type,
            required: item.is_nullable === 'NO',
            primary: false,
            unique: false,
            default: '',
            autoIncrement: false
          };
        });
        const reg = /\((\w+)(?:, (\w+))*\)/;
        indexs.forEach(item => {
          const match = item.indexdef.match(reg);
          if (!match) return;
          if (item.indexdef.indexOf(' pkey ') > -1 && ret[match[1]]) {
            ret[match[1]].primary = true;
          }
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
