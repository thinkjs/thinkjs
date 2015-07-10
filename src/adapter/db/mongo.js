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
    this.socket = null;
    this.db = null;
  }
  /**
   * connect mongo socket
   * @return {Promise} []
   */
  connect(){
    if(this.socket){
      return Promise.reoslve(this.db);
    }
    let instance = new MongoSocket(this.config);
    return instance.getConnection().then(db => {
      this.socket = instance;
      this.db = db;
      return db;
    })
  }
  /**
   * get connection
   * @return {Promise} []
   */
  collection(){
    return this.connect().then(db => {
      return db.collection(this.config.table);
    })
  }
}