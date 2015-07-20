'use strict';
/**
 * sqlite socket
 */
export default class extends think.adapter.socket {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config = {}){
    if(config.path === true){
      config.path = ':memory:';
    }else if(!config.path){
      config.path = think.getPath(undefined, `${think.dirname.runtime}/db/${config.name}.sqlite`);
    }
    this.config = config;
    this.connection = null;
    this.deferred = null;
  }
  /**
   * get connection
   * @return {Promise} []
   */
  async getConnection(){
    if(this.connection){
      return this.deferred.promise;
    }
    let sqlite = await think.npm('sqlite3');
    if(think.debug){
      sqlite = sqlite.verbose();
    }
    let deferred = think.defer();
    let db = new sqlite.Database(this.config.path, err => {
      if(err){
        deferred.reject(err);
        this.close();
      }else {
        deferred.resolve(db);
      }
    });
    //set timeout
    if(this.config.timeout){
      db.configure('busyTimeout', this.config.timeout * 1000);
    }
    this.connection = db;
    this.deferred = deferred;
    return deferred.promise;
  }
  /**
   * query sql
   * @param  {String} sql []
   * @return {Promise}     []
   */
  async execute(sql){
    if (this.config.log_sql) {
      think.log(sql, 'SQL');
    }
    let connection = await this.getConnection();
    let deferred = think.defer();
    //can not use arrow functions in here
    connection.run(sql, function(err) {
      if(err){
        deferred.reject(err);
      }else{
        deferred.resolve({
          insertId: this.lastID,
          affectedRows: this.changes
        });
      }
    });
    return deferred.promise;
  }
  /**
   * execute sql
   * @param  {String} sql []
   * @return {Promise}     []
   */
  async query(sql){
    if (this.config.log_sql) {
      think.log(sql, 'SQL');
    }
    let connection = await this.getConnection();
    let deferred = think.defer();
    connection.all(sql, function(err, data){
      if(err){
        deferred.reject(err);
      }else{
        deferred.resolve(data);
      }
    });
    return deferred.promise;
  }
  /**
   * close connections
   * @return {} []
   */
  close(){
    if(this.connection){
      this.connection.close();
      this.connection = null;
    }
  }
}