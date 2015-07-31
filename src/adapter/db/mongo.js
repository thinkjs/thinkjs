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
    this.lastInsertId = 0;
    this._socket = null; //Mongo socket instance
  }
  /**
   * connect mongo socket
   * @return {Promise} []
   */
  socket(){
    if(this._socket){
      return this._socket;
    }
    this._socket = new MongoSocket(this.config);
    return this._socket;
  }
  /**
   * get connection
   * @return {Promise} []
   */
  collection(table){
    let instance = this.socket();
    return instance.getConnection().then(db => db.collection(table));
  }
  /**
   * get last insert id
   * @return {String} []
   */
  getLastInsertId(){
    return this.lastInsertId;
  }
  /**
   * add data
   * @param {Objec} data    []
   * @param {Object} options []
   */
  async add(data, options){
    let collection = await this.collection(options.table);
    let result = await collection.insertOne(data, options);
    this.lastInsertId = result.insertedId;
    return result;
  }
  /**
   * add multi data
   * @param {Array} dataList []
   * @param {Object} options  []
   */
  async addMany(dataList, options){
    let collection = await this.collection(options.table);
    let result = await collection.insertMany(data, options);
    this.lastInsertId = result.insertedIds;
    return result;
  }
  /**
   * close socket
   * @return {} []
   */
  close(){
    if(this._socket){
      this._socket.close();
      this._socket = null;
    }
  }
}