'use strict';

import querystring from 'querystring';
import Base from './base.js';

/**
 * mongodb socket
 */
export default class extends Base {
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
    super.init(config);

    this.config = think.extend({}, {
      host: '127.0.0.1'
    }, config);
    this.config.port = this.config.port || 27017;
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
    //connect with auth
    if(this.config.user){
      auth = `${config.user}:${config.password}@`;
    }
    // connection options
    // http://mongodb.github.io/node-mongodb-native/2.0/tutorials/urls/
    let options = '';
    if(config.options){
      options = '?' + querystring.stringify(config.options);
    }

    //many hosts
    let hostStr = '';
    if(think.isArray(config.host)){
      hostStr = config.host.map((item, i) => {
        return item + ':' + (config.port[i] || config.port[0]);
      }).join(',');
    }else{
      hostStr = config.host + ':' + config.port;
    }

    let str = `mongodb://${auth}${hostStr}/${config.database}${options}`;

    return think.await(str, () => {
      let fn = think.promisify(mongo.MongoClient.connect, mongo.MongoClient);
      let promise = fn(str, this.config).then(connection => {
        this.logConnect(str, 'mongodb');
        //set logger level
        if(config.log_level){
          mongo.Logger.setLevel(config.log_level);
        }
        connection.on('error', () => {
          this.close();
        });
        connection.on('close', () => {
          this.connection = null;
        });
        this.connection = connection;
        return connection;
      }).catch(err => {
        this.logConnect(str, 'mongodb');
        return Promise.reject(err);
      });
      let err = new Error(str);
      return think.error(promise, err);
    });
  }
}