/**
 * mysql数据库
 * @return {[type]} [description]
 */
var mysqlSocket = thinkRequire('MysqlSocket');
module.exports = Db(function(){
  'use strict';

  return {
    /**
     * 连接数据库
     * @param  {[type]} config  [description]
     * @param  {[type]} linknum [description]
     * @return {[type]}         [description]
     */
    connect: function(config){
      return mysqlSocket(config);
    },
    /**
     * 查询一条sql
     * @param  string str
     * @return promise
     */
    query: function(str){
      this.setSql(str);
      var self = this;
      if (!(str in this.queryWaiting)) {
        this.queryWaiting[str] = [];
        return this.initConnect(false).query(str).then(function(data){
          data = self.bufferToString(data);
          process.nextTick(function(){
            self.queryWaiting[str].forEach(function(deferred){
              deferred.resolve(data);
            });
            delete self.queryWaiting[str];
          })
          return data;
        });
      }else{
        var deferred = getDefer();
        this.queryWaiting[str].push(deferred);
        return deferred.promise;
      }
    },
    /**
     * 将buffer转为string
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    bufferToString: function(data){
      if (!C('db_buffer_tostring') || !isArray(data)) {
        return data;
      }
      for(var i = 0, length = data.length; i < length; i++){
        for(var key in data[i]){
          if(isBuffer(data[i][key])){
            data[i][key] = data[i][key].toString();
          }
        }
      }
      return data;
    },
    /**
     * 执行一条sql, 返回影响的行数
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    execute: function(str){
      this.setSql(str);
      var self = this;
      return this.initConnect(true).query(str).then(function(data){
        if (data.insertId) {
          self.lastInsertId = data.insertId;
        }
        return data.affectedRows || 0;
      });
    },
    /**
     * 获取数据表字段信息
     * @param  string tableName 数据表名
     * @return promise 返回一个promise
     */
    getFields: function(tableName){
      var sql = 'SHOW COLUMNS FROM ' + this.parseKey(tableName);
      return this.query(sql).then(function(data){
        var ret = {};
        data.forEach(function(item){
          ret[item.Field] = {
            'name': item.Field,
            'type': item.Type,
            'notnull': item.Null === '',
            'default': item.Default,
            'primary': item.Key === 'PRI',
            'unique': item.Key === 'UNI',
            'autoinc': item.Extra.toLowerCase() === 'auto_increment'
          };
        });
        return ret;
      });
    },
    /**
     * 获取数据库的表信息
     * @param  {[type]} dbName [description]
     * @return {[type]}        [description]
     */
    getTables: function(dbName){
      var sql = 'SHOW TABLES';
      if (dbName) {
        sql += ' FROM ' + dbName;
      }
      return this.query(sql).then(function(data){
        return data.map(function(item){
          for(var key in item){
            return item[key];
          }
        });
      });
    },
    /**
     * 启动事务
     * @return {[type]} [description]
     */
    startTrans: function(){
      if (this.transTimes === 0) {
        this.transTimes++;
        return this.execute('START TRANSACTION');
      }
      this.transTimes++;
      return getPromise();
    },
    /**
     * 提交事务
     * @return {[type]} [description]
     */
    commit: function(){
      if (this.transTimes > 0) {
        this.transTimes = 0;
        return this.execute('COMMIT');
      }
      return getPromise();
    },
    /**
     * 回滚事务
     * @return {[type]} [description]
     */
    rollback: function(){
      if (this.transTimes > 0) {
        this.transTimes = 0;
        return this.execute('ROLLBACK');
      }
      return getPromise();
    },
    /**
     * 解析key
     * @param  {[type]} key [description]
     * @return {[type]}     [description]
     */
    parseKey: function(key){
      key = (key || '').trim();
      if (!(/[,\'\"\*\(\)`.\s]/.test(key))) {
        key = '`' + key + '`';
      }
      return key;
    },
    /**
     * 获取最后插入的id
     * @return {[type]} [description]
     */
    getLastInsertId: function(){
      return this.lastInsertId;
    },
    /**
     * 关闭连接
     * @return {[type]} [description]
     */
    close: function(){
      if (this.linkId) {
        this.linkId.close();
        this.linkId = null;
      }
    }
  };
});