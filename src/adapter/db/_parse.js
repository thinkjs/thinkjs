'use strict';

import querystring from 'querystring';

/**
 * sql parse class
 */
export default class {
  /**
   * constructor
   * @param  {} args []
   * @return {}      []
   */
  constructor(...args){
    this.init(...args);
  }
  /**
   * init
   * @return {} []
   */
  init(){
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
      'IN': 'IN',
      'NOTIN': 'NOT IN'
    }
  }
  /**
   * parse set
   * @param  {Object} data []
   * @return {String}      []
   */
  parseSet(data = {}){
    let set = [];
    for(let key in data){
      let value = this.parseValue(data[key]);
      if (think.isString(value)) {
        set.push(this.parseKey(key) + '=' + value);
      }
    }
    if(set.length){
      return ' SET ' + set.join(',');
    }
    return '';
  }
  /**
   * parse key
   * @param  {String} key []
   * @return {String}     []
   */
  parseKey(key){
    return key;
  }
  /**
   * parse value
   * @param  {Mixed} value []
   * @return {Mixed}       []
   */
  parseValue(value){
    if (think.isString(value)) {
      value = '\'' + this.escapeString(value) + '\'';
    }else if(think.isArray(value)){
      if (/^exp$/.test(value[0])) {
        value = value[1];
      }else{
        value = value.map(item => this.parseValue(item));
      }
    }else if(think.isBoolean(value)){
      value = value ? '1' : '0';
    }else if (value === null) {
      value = 'null';
    }
    return value;
  }
  /**
   * parse field
   * parseField('name');
   * parseField('name,email');
   * parseField({
   *     xx_name: 'name',
   *     xx_email: 'email'
   * })
   * @return {String} []
   */
  parseField(fields){
    if (think.isString(fields) && fields.indexOf(',') > -1) {
      fields = fields.split(/\s*,\s*/);
    }
    if (think.isArray(fields)) {
      return fields.map(item => this.parseKey(item)).join(',');
    }else if(think.isObject(fields)){
      let data = [];
      for(let key in fields){
        data.push(this.parseKey(key) + ' AS ' + this.parseKey(fields[key]));
      }
      return data.join(',');
    }else if(think.isString(fields) && fields){
      return this.parseKey(fields);
    }
    return '*';
  }
  /**
   * parse table
   * @param  {Mixed} tables []
   * @return {}        []
   */
  parseTable(table){
    if (think.isString(table)) {
      table = table.split(/\s*,\s*/);
    }
    if (think.isArray(table)) {
      return table.map(item => this.parseKey(item)).join(',');
    }else if (think.isObject(table)) {
      let data = [];
      for(let key in table){
        data.push(this.parseKey(key) + ' AS ' + this.parseKey(table[key]));
      }
      return data.join(',');
    }
    return '';
  }
  /**
   * get logic
   * @param  {String} logic    []
   * @param  {String} _default []
   * @return {String}          []
   */
  getLogic(logic, _default = 'AND'){
    let list = ['AND', 'OR', 'XOR'];
    if(think.isObject(logic)){
      let _logic = logic._logic;
      delete logic._logic;
      logic = _logic;
    }
    if(!logic){
      return _default;
    }
    logic = logic.toUpperCase();
    if(list.indexOf(logic) > -1){
      return logic;
    }
    return _default;
  }
  /**
   * parse where
   * @param  {Mixed} where []
   * @return {String}       []
   */
  parseWhere(where){
    if(think.isEmpty(where)){
      return '';
    }else if (think.isString(where)) {
      return ` WHERE ${where}`;
    }
    let logic = this.getLogic(where);
    //safe key regexp
    let keySafeRegExp = /^[\w\|\&\-\.\(\)\,]+$/;
    let multi = where._multi;
    delete where._multi;
    let fn = (item, i) => {
      let v = multi ? val[i] : val;
      return '(' + this.parseWhereItem(this.parseKey(item), v) + ')';
    };
    let key, val, result = [], str = '';
    for(key in where){
      val = where[key];
      str = '( ';
      //_string: ''
      if (key[0] === '_') {
        str += this.parseThinkWhere(key, val);
      }
      else if (!keySafeRegExp.test(key)) {
        throw new Error(think.local('INVALID_WHERE_CONDITION_KEY'));
      }
      //title|content
      else if (key.indexOf('|') > -1) {
        str += key.split('|').map(fn).join(' OR ');
      }
      //title&content
      else if (key.indexOf('&') > -1) {
        str += key.split('&').map(fn).join(' AND ');
      }else{
        str += this.parseWhereItem(this.parseKey(key), val);
      }
      str += ' )';
      result.push(str);
    }
    result = result.join(` ${logic} `);
    return result ? (` WHERE ` + result) : '';
  }
 /**
  * parse where item
  * @param  {String} key []
  * @param  {Mixed} val []
  * @return {String}     []
  */
  parseWhereItem(key, val){
    // {id: {'<': 10, '>': 1}}
    if (think.isObject(val)) { 
      let logic = this.getLogic(val);
      let result = [];
      for(let opr in val){
        let nop = opr.toUpperCase();
        nop = this.comparison[nop] || nop;
        result.push(key + ' ' + nop + ' ' + this.parseValue(val[opr]));
      } 
      return result.join(' ' + logic + ' ');
    }
    else if (!think.isArray(val)) {
      return key + ' = ' + this.parseValue(val);
    }

    let whereStr = '';
    let data;
    if (think.isString(val[0])) {
      let val0 = val[0].toUpperCase();
      val0 = this.comparison[val0] || val0;
      if (/^(=|!=|>|>=|<|<=)$/.test(val0)) { // compare
        whereStr += key + ' ' + val0 + ' ' + this.parseValue(val[1]);
      }else if (/^(NOT\s+LIKE|LIKE)$/.test(val0)) { // like
        if (think.isArray(val[1])) { //
          let likeLogic = (val[2] || 'OR').toUpperCase();
          let likesLogic = ['AND','OR','XOR'];
          if (likesLogic.indexOf(likeLogic) > -1) {
            let like = val[1].map(item => key + ' ' + val0 + ' ' + this.parseValue(item)).join(' ' + likeLogic + ' ');
            whereStr += '(' + like + ')';
          }
        }else{
          whereStr += key + ' ' + val0 + ' ' + this.parseValue(val[1]);
        }
      }else if(val0 === 'EXP'){ //
        whereStr += '(' + key + ' ' + val[1] + ')';
      }else if(val0 === 'IN' || val0 === 'NOT IN'){ // IN 运算
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
      }else if(val0 === 'BETWEEN'){ // 
        data = think.isString(val[1]) ? val[1].split(',') : val[1];
        if (!think.isArray(data)) {
          data = [val[1], val[2]];
        }
        whereStr += ' (' + key + ' ' + val0 + ' ' + this.parseValue(data[0]);
        whereStr += ' AND ' + this.parseValue(data[1]) + ')';
      }else{
        console.log('_EXPRESS_ERROR_', key, val);
        return '';
      }
    }else{
      let length = val.length;
      let logic = 'AND';
      if (think.isString(val[length - 1])) {
        let last = val[length - 1].toUpperCase();
        if (last && ['AND', 'OR', 'XOR'].indexOf(last) > -1) {
          logic = last;
          length--;
        }
      }
      for(let i = 0; i < length; i++){
        let isArr = think.isArray(val[i]);
        data = isArr ? val[i][1] : val[i];
        let exp = ((isArr ? val[i][0] : '') + '').toUpperCase();
        if (exp === 'EXP') {
          whereStr += '(' + key + ' ' + data + ') ' + logic + ' ';
        }else{
          let op = isArr ? (this.comparison[val[i][0].toUpperCase()] || val[i][0]) : '=';
          whereStr += '(' + key + ' ' + op + ' ' + this.parseValue(data) + ') ' + logic + ' ';
        }
      }
      whereStr = whereStr.substr(0, whereStr.length - 4);
    }
    return whereStr;
  }
  /**
   * parse special condition
   * @param  {String} key []
   * @param  {Mixed} val []
   * @return {String}     []
   */
  parseThinkWhere(key, val){
    switch(key){
      case '_string':
        return val;
      case '_complex':
        return this.parseWhere(val).substr(6);
      case '_query':
        let where = think.isString(val) ? querystring.parse(val) : val;
        let logic = this.getLogic(where);
        let arr = [];
        for(let name in where){
          val = this.parseKey(name) + ' = ' + this.parseValue(where[name]);
          arr.push(val);
        }
        return arr.join(` ${logic} `);
    }
    return '';
  }
  /**
   * parse limit
   * @param  {String} limit []
   * @return {}       []
   */
  parseLimit(limit){
    if (think.isEmpty(limit)) {
      return '';
    }
    if(think.isString(limit)){
      limit = limit.split(/\s*,\s*/);
    }
    let data = [limit[0] | 0];
    if(limit[1]){
      data.push(limit[1] | 0);
    }
    return ' LIMIT ' + data.join(',');
  }
  /**
   * parse join
   * @param  {String} join []
   * @return {String}      []
   */
  parseJoin(join, options = {}){
    if (think.isEmpty(join)) {
      return '';
    }
    let joinStr = '';
    let defaultJoin = ' LEFT JOIN ';
    if (think.isArray(join)) {
      let joins = {
        'left': ' LEFT JOIN ',
        'right': ' RIGHT JOIN ',
        'inner': ' INNER JOIN '
      };
      join.forEach(val => {
        if (think.isString(val)) {
          let hasJoin = val.toLowerCase().indexOf(' join ') > -1;
          joinStr += (hasJoin ? ' ' : defaultJoin) + val;
        }else if (think.isObject(val)) {
          let ret = [];
          if (!('on' in val)) {
            for(let key in val){
              let v = val[key];
              v.table = key;
              ret.push(v);
            }
          }else{
            ret.push(val);
          }
          ret.forEach(item => {
            let joinType = joins[item.join] || item.join || defaultJoin;
            let table = item.table.trim();
            if( /\s+/.test(table) ) {
              if( table.indexOf('(') !== 0 ) {
                table = '(' + table + ')';
              }
              joinStr += joinType + table;
            } else {
              table = options.tablePrefix + table;
              joinStr += joinType + '`' + table + '`';
            }
            if (item.as) {
              joinStr += ' AS ' + item.as;
            }
            if (item.on) {
              let mTable = options.alias || options.table;
              let jTable = item.as || table;
              if (think.isObject(item.on)) {
                let where = [];
                for(let key in item.on){
                  where.push([
                    key.indexOf('.') > -1 ? key : (mTable + '.`' + key + '`'),
                    '=',
                    item.on[key].indexOf('.') > -1 ? item.on[key] : (jTable + '.`' + item.on[key] + '`')
                  ].join(''));
                }
                joinStr += ' ON (' + where.join(' AND ') + ')';
              }else{
                if (think.isString(item.on)) {
                  item.on = item.on.split(/\s*,\s*/);
                }
                joinStr += ' ON ' + (item.on[0].indexOf('.') > -1 ? item.on[0] : (mTable + '.`' + item.on[0] + '`'));
                joinStr += '=' + (item.on[1].indexOf('.') > -1 ? item.on[1] : (jTable + '.`' + item.on[1] + '`'));
              }
            }
          })
        }
      });
    }else{
      joinStr += defaultJoin + join;
    }
    return joinStr;
  }
  /**
   * parse order
   * @param  {String} order []
   * @return {String}       []
   */
  parseOrder(order){
    if(think.isEmpty(order)){
      return '';
    }
    if (think.isArray(order)) {
      order = order.map(item => this.parseKey(item)).join(',');
    }else if (think.isObject(order)) {
      let arr = [];
      for(let key in order){
        let val = order[key];
        val = this.parseKey(key) + ' ' + val;
        arr.push(val);
      }
      order = arr.join(',');
    }
    return ` ORDER BY ${order}`;
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
      group = group.split(/\s*,\s*/);
    }
    let result = group.map(item => {
      if (item.indexOf('.') === -1) {
        return '`' + item + '`';
      }else{
        item = item.split('.');
        return item[0] + '.`' + item[1] + '`'; 
      }
    });
    return ' GROUP BY ' + result.join(',');
  }
  /**
   * parse having
   * @param  {String} having []
   * @return {}        []
   */
  parseHaving(having){
    return having ? ` HAVING ${having}` : '';
  }
  /**
   * parse comment
   * @param  {String} comment []
   * @return {String}         []
   */
  parseComment(comment){
    return comment ? (` /*${comment}*/ `) : '';   
  }
  /**
   * parse distinct
   * @param  {} distinct []
   * @return {}          []
   */
  parseDistinct(distinct){
    return distinct ? ' Distinct ' : '';
  }
  /**
   * parse union
   * @param  {String} union []
   * @return {}       []
   */
  parseUnion(union){
    if (!union) {
      return '';
    }
    if (think.isArray(union)) {
      let sql = '';
      union.forEach(item => {
        sql += item.all ? 'UNION ALL ' : 'UNION ';
        sql += '(' + (think.isObject(item.union) ? this.buildSelectSql(item.union).trim() : item.union) + ') ';
      })
      return sql;
    }else{
      return 'UNION (' + (think.isObject(union) ? this.buildSelectSql(union).trim() : union) + ') '; 
    }
  }
  /**
   * parse lock
   * @param  {Boolean} lock []
   * @return {}      []
   */
  parseLock(lock){
    if (!lock) {
      return '';
    }
    return ' FOR UPDATE ';
  }
  /**
   * parse sql
   * @param  {String} sql     []
   * @param  {Object} options []
   * @return {String}         []
   */
  parseSql(sql, options = {}){
    return sql.replace(/\%([A-Z]+)\%/g, (a, type) => {
      type = type.toLowerCase();
      let ucfirst = type[0].toUpperCase() + type.slice(1);
      return this['parse' + ucfirst](options[type] || '', options);
    }).replace(/\s__([A-Z_-]+)__\s/g, (a, b) => {
      return ' `' + this.config.prefix + b.toLowerCase() + '` ';
    });
  }
  /**
   * escape string, override in sub class
   * @param  {String} str []
   * @return {String}     []
   */
  escapeString(str){
    return str;
  }
  /**
   * get select sql
   * @param  {Object} options []
   * @return {String}         [sql string]
   */
  buildSelectSql(options){
    return this.parseSql(this.selectSql, options) + this.parseLock(options.lock);
  }
}