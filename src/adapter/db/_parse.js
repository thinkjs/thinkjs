'use strict';
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
      fields = fields.split(',');
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
      table = table.split(',');
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
   * parse where
   * @param  {Mixed} where []
   * @return {String}       []
   */
  parseWhere(where = {}){
    let whereStr = '';
    if (think.isString(where)) {
      whereStr = where;
    }else{
      let oList = ['AND', 'OR', 'XOR'];
      let operate = (where._logic + '').toUpperCase();
      delete where._logic;
      operate = oList.indexOf(operate) > -1 ? ' ' + operate + ' ' : ' AND ';
      //safe key regexp
      let keySafeRegExp = /^[\w\|\&\-\.\(\)\,]+$/;
      let multi = where._multi;
      delete where._multi;
      let val;
      let fn = (item, i) => {
        let v = multi ? val[i] : val;
        return '(' + this.parseWhereItem(this.parseKey(item), v) + ')';
      };
      for(let key in where){
        key = key.trim();
        val = where[key];
        whereStr += '( ';
        if (key.indexOf('_') === 0) {
          whereStr += this.parseThinkWhere(key, val);
        }else{
          if (!keySafeRegExp.test(key)) {
            console.log(key + ' is not safe');
            continue;
          }
          let arr;
          // support name|title|nickname
          if (key.indexOf('|') > -1) {
            arr = key.split('|');
            whereStr += arr.map(fn).join(' OR ');
          }else if (key.indexOf('&') > -1) {
            arr = key.split('&');
            whereStr += arr.map(fn).join(' AND ');
          }else{
            whereStr += this.parseWhereItem(this.parseKey(key), val);
          }
        }
        whereStr += ' )' + operate;
      }
      whereStr = whereStr.substr(0, whereStr.length - operate.length);
    }

    return whereStr ? (' WHERE ' + whereStr) : '';
  }
 /**
  * parse where item
  * @param  {String} key []
  * @param  {Mixed} val []
  * @return {String}     []
  */
  parseWhereItem(key, val){
    if (think.isObject(val)) { // {id: {'<': 10, '>': 1}}
      let logic = (val._logic || 'AND').toUpperCase();
      delete val._logic;
      let result = [];
      for(let opr in val){
        let nop = opr.toUpperCase();
        nop = this.comparison[nop] || nop;
        result.push(key + ' ' + nop + ' ' + this.parseValue(val[opr]));
      } 
      return result.join(' ' + logic + ' ');
    }else if (!think.isArray(val)) {
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
      }else if(val0 === 'EXP'){ // 使用表达式
        whereStr += '(' + key + ' ' + val[1] + ')';
      }else if(val0 === 'IN' || val0 === 'NOT IN'){ // IN 运算
        if (val[2] === 'exp') {
          whereStr += key + ' ' + val0 + ' ' + val[1];
        }else{
          if (think.isString(val[1])) {
            val[1] = val[1].split(',');
          }
          //如果不是数组，自动转为数组
          if (!think.isArray(val[1])) {
            val[1] = [val[1]];
          }
          val[1] = this.parseValue(val[1]);
          //如果只有一个值，那么变成＝或者!=
          if (val[1].length === 1) {
            whereStr += key + (val0 === 'IN' ? ' = ' : ' != ') + val[1];
          }else{
            whereStr += key + ' ' + val0 + ' (' + val[1].join(',') + ')';
          }
        }
      }else if(val0 === 'BETWEEN'){ // BETWEEN运算
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
      let rule = 'AND';
      if (think.isString(val[length - 1])) {
        let last = val[length - 1].toUpperCase();
        if (last && ['AND', 'OR', 'XOR'].indexOf(last) > -1) {
          rule = last;
          length--;
        }
      }
      for(let i = 0; i < length; i++){
        let isArr = think.isArray(val[i]);
        data = isArr ? val[i][1] : val[i];
        let exp = ((isArr ? val[i][0] : '') + '').toUpperCase();
        if (exp === 'EXP') {
          whereStr += '(' + key + ' ' + data + ') ' + rule + ' ';
        }else{
          let op = isArr ? (this.comparison[val[i][0].toUpperCase()] || val[i][0]) : '=';
          whereStr += '(' + key + ' ' + op + ' ' + this.parseValue(data) + ') ' + rule + ' ';
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
        let op = ' AND ';
        if (where._logic) {
          op = ' ' + where._logic.toUpperCase() + ' ';
          delete where._logic;
        }
        let arr = [];
        for(let name in where){
          val = this.parseKey(name) + ' = ' + this.parseValue(where[name]);
          arr.push(val);
        }
        return arr.join(op);
    }
    return '';
  }
  /**
   * parse limit
   * @param  {String} limit []
   * @return {}       []
   */
  parseLimit(limit){
    if (!limit) {
      return '';
    }
    if(think.isString(limit)){
      limit = limit.split(',');
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
  parseJoin(join, options){
    if (!join) {
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
    return order ? (' ORDER BY ' + order) : '';
  }
  /**
   * parse group
   * @param  {String} group []
   * @return {String}       []
   */
  parseGroup(group){
    if (!group) {
      return '';
    }
    if (think.isString(group)) {
      group = group.split(',');
    }
    let result = [];
    group.forEach(item => {
      item = item.trim();
      if (!item) {
        return;
      }
      if (item.indexOf('.') === -1) {
        result.push('`' + item + '`');
      }else{
        item = item.split('.');
        result.push(item[0] + '.`' + item[1] + '`'); 
      }
    })
    if (!result.length) {
      return '';
    }
    return ' GROUP BY ' + result.join(',');
  }
  /**
   * parse having
   * @param  {String} having []
   * @return {}        []
   */
  parseHaving(having){
    return having ? (' HAVING ' + having) : '';
  }
  /**
   * parse comment
   * @param  {String} comment []
   * @return {String}         []
   */
  parseComment(comment){
    return comment ? (' /* ' + comment + '*/') : '';   
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
   * @param  {[type]} sql     [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  parseSql(sql, options = {}){
    return sql.replace(/\%([A-Z]+)\%/g, (a, type) => {
      type = type.toLowerCase();
      let ucfirst = type[0].toUpperCase() + type.slice(1);
      return this['parse' + ucfirst](options[type] || '', options);
    }).replace(/__([A-Z_-]+)__/g, (a, b) => {
      return '`' + this.config.prefix + b.toLowerCase() + '`';
    });
  }
}