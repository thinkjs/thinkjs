'use strict';

import Base from './base.js';

let PostgreSocket = think.adapter('socket', 'postgresql');
/**
 * postgre db
 */
export default class extends Base {
  /**
   * init
   * @return {} []
   */
  init(config = {}){
    this.config = config;
    //operate
    this.comparison = {
      'EQ': '=',
      'NEQ': '!=',
      '<>': '!=',
      'GT': '>',
      'EGT': '>=',
      'LT': '<',
      'ELT': '<=',
      'NOTLIKE': 'NOT LIKE',
      'LIKE': 'LIKE',
      'NOTILIKE': 'NOT ILIKE',
      'ILIKE': 'ILIKE',
      'IN': 'IN',
      'NOTIN': 'NOT IN',
      'BETWEEN': 'BETWEEN',
      'NOTBETWEEN': 'NOT BETWEEN'
    };
    this.selectSql = '%EXPLAIN%SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT%%UNION%%COMMENT%';
  }
  /**
   * get postgre socket instance
   * @param  {Object} config []
   * @return {}        []
   */
  socket(sql){
    if(this._socket){
      return this._socket;
    }
    let config = think.extend({
      sql: sql
    }, this.config);
    this._socket = PostgreSocket.getInstance(config, thinkCache.DB, ['sql']);
    return this._socket;
  }
  /**
   * get table info
   * @param  {String} table [table name]
   * @return {Promise}       []
   */
  async getSchema(table){
    let columnSql = `SELECT column_name,is_nullable,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='${table}'`;
    let columnsPromise = this.query(columnSql);
    let indexSql = `SELECT indexname,indexdef FROM pg_indexes WHERE tablename='${table}'`;
    let indexPromise = this.query(indexSql);
    let [columns, indexs] = await Promise.all([columnsPromise, indexPromise]);
    let schema = {};
    columns.forEach(item => {
      schema[item.column_name] = {
        name: item.column_name,
        type: item.data_type,
        required: item.is_nullable === 'NO',
        default: '',
        auto_increment: false
      };
    });
    let extra = {};
    let reg = /\((\w+)(?:, (\w+))*\)/;
    indexs.forEach(item => {
      let [, name, ...others] = item.indexdef.match(reg);
      extra[name] = {};
      if(item.indexdef.indexOf(' pkey ') > -1){
        extra[name].primary = true;
      }
      let index = item.indexdef.indexOf(' UNIQUE ') > -1 ? 'unique' : 'index';
      extra[name][index] = others.length ? others : true;
    });

    return think.extend(schema, extra);
  }
  /**
   * start transaction
   * @return {Promise} []
   */
  startTrans(){
    if (this.transTimes === 0) {
      this.transTimes++;
      return this.execute('BEGIN');
    }
    this.transTimes++;
    return Promise.resolve();
  }
  /**
  * parse where item
  * @param  {String} key []
  * @param  {Mixed} val []
  * @return {String}     []
  */
  parseWhereItem(key, val){
    // {id: null}
    if(val === null){
      return `${key} IS NULL`;
    }
    // {id: {'<': 10, '>': 1}}
    else if (think.isObject(val)) { 
      let logic = this.getLogic(val);
      let result = [];
      for(let opr in val){
        let nop = opr.toUpperCase();
        nop = this.comparison[nop] || nop;
        let parsedValue = this.parseValue(val[opr]);
        //{id: {IN: [1, 2, 3]}}
        if(think.isArray(parsedValue)){
          result.push(`${key} ${nop} (${parsedValue.join(', ')})`);
        }
        else if(parsedValue === 'null'){
          result.push(key + ' ' + (nop === '!=' ? 'IS NOT NULL' : 'IS NULL'));
        }
        else{
          result.push(key + ' ' + nop + ' ' + parsedValue);
        }
      }
      return result.join(' ' + logic + ' ');
    }
    // where({id: [1, 2, 3]})
    else if(think.isArray(val)){
      let flag = think.isNumber(val[0]) || think.isNumberString(val[0]);
      if(flag){
        flag = val.every(item => {
          return think.isNumber(item) || think.isNumberString(item);
        });
        if(flag){
          return `${key} IN ( ${val.join(', ')} )`;
        }
      }
    }
    else {
      return key + ' = ' + this.parseValue(val);
    }

    let whereStr = '';
    let data;
    if (think.isString(val[0])) {
      let val0 = val[0].toUpperCase();
      val0 = this.comparison[val0] || val0;
      // compare
      if (/^(=|!=|>|>=|<|<=)$/.test(val0)) {
        if(val[1] === null){
          whereStr += key + ' ' + (val[0] === '!=' ? 'IS NOT NULL' : 'IS NULL');
        }else{
          whereStr += key + ' ' + val0 + ' ' + this.parseValue(val[1]);
        }
      }
      // like or not like
      else if (/^(NOT\s+LIKE|LIKE|NOT\s+ILIKE|ILIKE)$/.test(val0)) { 
        if (think.isArray(val[1])) {
          //get like logic, default is OR
          let likeLogic = this.getLogic(val[2], 'OR');
          let like = val[1].map(item => key + ' ' + val0 + ' ' + this.parseValue(item)).join(' ' + likeLogic + ' ');
          whereStr += '(' + like + ')';
        }else{
          whereStr += key + ' ' + val0 + ' ' + this.parseValue(val[1]);
        }
      }
      // exp
      else if(val0 === 'EXP'){ 
        whereStr += '(' + key + ' ' + val[1] + ')';
      }
      // in or not in
      else if(val0 === 'IN' || val0 === 'NOT IN'){
        if (val[2] === 'exp') {
          whereStr += key + ' ' + val0 + ' ' + val[1];
        }else{
          if (think.isString(val[1])) {
            val[1] = val[1].split(',');
          }
          if (!think.isArray(val[1])) {
            val[1] = [val[1]];
          }
          val[1] = this.parseValue(val[1]);
          if (val[1].length === 1) {
            whereStr += key + (val0 === 'IN' ? ' = ' : ' != ') + val[1];
          }else{
            whereStr += key + ' ' + val0 + ' (' + val[1].join(',') + ')';
          }
        }
      }
      //between
      else if(val0 === 'BETWEEN' || val0 === 'NOT BETWEEN'){
        data = think.isString(val[1]) ? val[1].split(',') : val[1];
        if (!think.isArray(data)) {
          data = [val[1], val[2]];
        }
        whereStr += ' (' + key + ' ' + val0 + ' ' + this.parseValue(data[0]);
        whereStr += ' AND ' + this.parseValue(data[1]) + ')';
      }else{
        throw new Error(think.locale('WHERE_CONDITION_INVALID', key, JSON.stringify(val)));
      }
    }else{

      let length = val.length;
      let logic = this.getLogic(val[length - 1], '');
      if(logic){
        length--;
      }else{
        logic = 'AND';
      }
      let result = [];
      for(let i = 0; i < length; i++){
        let isArr = think.isArray(val[i]);
        data = isArr ? val[i][1] : val[i];
        let exp = ((isArr ? val[i][0] : '') + '').toUpperCase();
        if (exp === 'EXP') {
          result.push(`(${key} ${data})`);
        }else{
          let op = isArr ? (this.comparison[val[i][0].toUpperCase()] || val[i][0]) : '=';
          result.push(`(${key} ${op} ${this.parseValue(data)})`);
        }
      }
      whereStr = result.join(` ${logic} `);
    }
    return whereStr;
  }
  quoteKey(key){
    if (key === undefined || think.isEmpty(key)) {
      return '';
    }
    if(think.isNumber(key) || think.isNumberString(key)){
      return key;
    }
    if (/.*\(.*\)/.test(key)) {
      return key;
    }
    if(/(.*[a-z0-9]+)(\")([a-z0-9]+.*)/i.test(key)) {
      return key.replace(/(.*[a-z0-9]+)(\")([a-z0-9]+.*)/i, '\"$1\"\"$3\"');
    } else {
      return `"${key}"`;
    }
  }
  /**
   * parse key
   * @param  {String} key []
   * @return {String}     []
   */
  parseKey(key){
    if (key === undefined) {
      return '';
    }
    if(think.isNumber(key) || think.isNumberString(key)){
      return key;
    }
    key = key.trim();
    if(think.isEmpty(key)){
      return '';
    }
    // EXAMPLE: 'user_age(birthday)' or 'user_age(birthday) AS age' 
    if (/.*\(.*\)/.test(key)) {
      return key;
    }
    var isDistinct = false;
    if(/DISTINCT (.*)/i.test(key)) {
      isDistinct = true;
      key = key.replace(/DISTINCT (.*)/i, '$1');
    }
    if(/.*\..*/.test(key)) {
      var k = key.split('.'), j = [];
      k.forEach( i => {
        var tmp = this.quoteKey(i.replace(/^[\"]+|[\"]+$/g, ''));
        j.push(`${tmp}`);
      } );
      key = j.join('.');
    } else {
      key = this.quoteKey(key.replace(/^[\"]+|[\"]+$/g, ''));
    }
    return `${isDistinct ? 'DISTINCT ' : ''}${key}`;
  }
  /**
   * parse group
   * @param  {String} group []
   * @return {String}       []
   */
  parseGroup(group){
    if (think.isEmpty(group)) {
      return '';
    }
    if (think.isString(group)) {
      //group may be `date_format(create_time,'%Y-%m-%d')`
      if (group.indexOf('(') !== -1) {
        return ' GROUP BY ' + group;
      }
      group = group.split(/\s*,\s*/);
    }
    var result;

    if (think.isArray(group)) {
      result = group.map(function (item) {
        item = item.replace(/[\"]/g, '');
        var type = '',
            regexp = /(.*) (ASC|DESC)/i,
            matches = item.match(regexp);

        if (matches !== null) {
          type = ' ' + matches[2];
          item = item.replace(regexp, '$1');
        }

        if (item.indexOf('.') === -1) {
          return '"' + item + '"' + type;
        } else {
          item = item.split('.');
          return '"' + item[0] + '"."' + item[1] + '"' + type;
        }
      });

      return ' GROUP BY ' + result.join(', ');
      /**
       * Example: { 'name': 'DESC' } || { 'name': -1 }
       */
    } else if (think.isObject(group)) {
      result = [];

      for (let key in group) {
        let type = group[key],
            matches;

        key = key.replace(/[\"]/g, '');

        if (think.isString(type)) {
          matches = type.match(/.*(ASC|DESC)/i);
        }

        if (matches) {
          type = ' ' + matches[1];
        } else if (think.isNumber(type) || think.isNumberString(type)) {
          type = parseInt(type) === -1 ? ' DESC' : ' ASC';
        }

        if (key.indexOf('.') === -1) {
          result.push('"' + key + '"' + type);
        } else {
          key = key.split('.');

          result.push('"' + key[0] + '"."' + key[1] + '"' + type);
        }
      }

      return ' GROUP BY ' + result.join(', ');
    } else {
      /** Unknown format: */
    }
  }
  /**
   * parse limit
   * @param  {String} limit []
   * @return {String}       []
   */
  parseLimit(limit){
    if (think.isEmpty(limit)) {
      return '';
    }
    if(think.isNumber(limit)){
      return ` LIMIT ${limit}`;
    }
    if(think.isString(limit)){
      limit = limit.split(/\s*,\s*/);
    }
    if(limit[1]){
      return ' LIMIT ' + (limit[1] | 0) + ' OFFSET ' + (limit[0] | 0);
    }
    return ' LIMIT ' + (limit[0] | 0);
  }
  /**
   * parse value
   * @param  {Mixed} value []
   * @return {Mixed}       []
   */
  parseValue(value){
    if (think.isString(value)) {
      value = 'E\'' + this.escapeString(value) + '\'';
    }else if(think.isArray(value)){
      if (/^exp$/.test(value[0])) {
        value = value[1];
      }else{
        value = value.map(item => this.parseValue(item));
      }
    }else if(think.isBoolean(value)){
      value = value ? 'true' : 'false';
    }else if (value === null) {
      value = 'null';
    }
    return value;
  }
  /**
   * query string
   * @param  string str
   * @return promise
   */
  query(sql){
    this.sql = sql;
    return think.await(sql, () => {
      return this.socket(sql).query(sql).then(data => {
        return this.bufferToString(data.rows);
      });
    });
  }
  /**
   * execute sql
   * @param  {String} sql []
   * @return {}     []
   */
  execute(sql){
    this.sql = sql;
    let insertInto = 'insert into ';
    let prefix = sql.slice(0, insertInto.length).toLowerCase();
    let isInsert = false;
    if(prefix === insertInto){
      sql += ' RETURNING id';
      isInsert = true;
    }
    return this.socket(sql).execute(sql).then(data => {
      if(isInsert){
        this.lastInsertId = data.rows[0].id;
      }
      return data.rowCount || 0;
    });
  }
}