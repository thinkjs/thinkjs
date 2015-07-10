'use strict';
/**
 * mongodb socket
 */
export default class extends think.adapter.socket {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
    this.config = think.extend({}, {
      host: '127.0.0.1',
      port: 27017
    }, config);

    this.connection = null;
    this.deferred = null;
  }
  /**
   * get connection
   * @return {Promise} []
   */
  async getConnection(){
    let deferred = think.defer();
    let mongo = await think.npm('mongodb');
    let client = mongo.MongoClient;
    let auth = '';
    let config = this.config;
    if(this.config.user){
      auth = `${config.user}:${config.pwd}@`;
    }
    let url = `mongodb://${auth}${config.host}:${config.port}/${config.name}`;
    client.connect(url, this.config, (err, connection) => {
      if(err){
        deferred.reject(err);
        this.close();
      }else{
        this.connection = connection;
        deferred.resolve(this.connection);
      }
    });
    return deferred.promise;
  }
  /**
   * close mongo socket connection
   * @return {} []
   */
  close(){
    if(this.connection){
      this.connection.close();
      this.connection = null;
    }
  }
}