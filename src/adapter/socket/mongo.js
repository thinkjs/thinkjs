'use strict';

import querystring from 'querystring';

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
    super.init(config);

    this.config = think.extend({}, {
      host: '127.0.0.1',
      port: 27017
    }, config);
  }
  /**
   * get connection
   * @return {Promise} []
   */
  async getConnection(){
    if(this.connection){
      return this.connection;
    }
    let mongo = await think.npm('mongodb');
    let config = this.config;
    let auth = '';

    this.mongo = mongo;
    if(this.config.user){
      auth = `${config.user}:${config.pwd}@`;
    }
    // connection options
    // http://mongodb.github.io/node-mongodb-native/2.0/tutorials/urls/
    let options = '';
    if(config.options){
      options = '?' + querystring.stringify(config.options);
    }
    let url = `mongodb://${auth}${config.host}:${config.port}/${config.name}${options}`;
    
    return think.await(url, () => {
      let deferred = think.defer();
      mongo.MongoClient.connect(url, this.config, (err, connection) => {
        if(err){
          deferred.reject(err);
        }else{
          //set logger level
          if(config.log_level){
            mongo.Logger.setLevel(config.log_level);
          }
          this.connection = connection;
          deferred.resolve(connection);
        }
      });
      return deferred.promise.catch(err => {
        err = think.error(err, 'mongodb://${auth}${config.host}:${config.port}');
        return think.reject(new Error(err.message));
      });
    });
  }
}