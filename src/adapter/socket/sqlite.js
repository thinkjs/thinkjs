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
    super.init(config);

    if(config.path === true){
      config.path = ':memory:';
    }else{
      config.path = config.path || think.getPath(undefined, think.dirname.runtime) + `/sqlite`;
      think.mkdir(config.path);
      config.path += `/${config.name}.sqlite`;
    }
    this.config = config;
  }
  /**
   * get connection
   * @return {Promise} []
   */
  async getConnection(){
    if(this.connection){
      return this.connection;
    }
    let sqlite = await think.npm('sqlite3');
    if(think.debug){
      sqlite = sqlite.verbose();
    }
    return think.await(this.config.path, () => {
      let deferred = think.defer();
      let db = new sqlite.Database(this.config.path, err => {
        if(err){
          deferred.reject(err);
        }else {
          this.connection = db;
          deferred.resolve(db);
        }
      });
      //set timeout
      if(this.config.timeout){
        db.configure('busyTimeout', this.config.timeout * 1000);
      }
      let err = new Error(`sqlite://${this.config.path}`);
      return think.error(deferred.promise, err);
    });
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
    return think.error(deferred.promise);
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
    connection.all(sql, (err, data) => err ? deferred.reject(err) : deferred.resolve(data));
    return think.error(deferred.promise);
  }
}