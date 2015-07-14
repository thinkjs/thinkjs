'use strict';

let MongoSocket = think.adapter('socket', 'mongo');
/**
 * mongo db class
 */
export default class {
  /**
   * constructor
   * @param  {Array} args []
   * @return {}         []
   */
  constructor(...args){
    this.init(...args);
  }
  /**
   * init
   * @param  {Object} config []
   * @return {}        []
   */
  init(config){
    this.config = config;
    this.socket = null; //Mongo socket instance
  }
  /**
   * connect mongo socket
   * @return {Promise} []
   */
  getSocketInstance(){
    if(this.socket){
      return this.socket;
    }
    this.socket = new MongoSocket(this.config);
    return this.socket;
  }
  /**
   * get connection
   * @return {Promise} []
   */
  collection(table){
    return this.getSocketInstance().getConnection().then(db => {
      return db.collection(table);
    });
  }
}