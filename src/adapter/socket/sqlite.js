'use strict';

export default class extends think.adapter.socket {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
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
    let db = new sqlite3.Database(this.config.path, err => {
      if(err){
        deferred.reject(err);
        this.close();
      }else {
        deferred.resolve(db);
      }
    });
    this.connection = db;
    this.deferred = deferred;
    return deferred.promise;
  }
  /**
   * query sql
   * @param  {String} sql []
   * @return {Promise}     []
   */
  async query(sql){
    let connection = await this.getConnection();
    //can not use arrow functions in here
    return connection.run(sql, function() {
      return {
        insertId: this.lastID,
        affectedRows: this.changes
      }
    })
  }
  /**
   * execute sql
   * @param  {String} sql []
   * @return {Promise}     []
   */
  async execute(sql){
    let connection = await this.getConnection();
    return connection.all(sql);
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