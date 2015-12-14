'use strict';

/**
 * parallel limit
 */
export default class extends think.base {
  /**
   * limit
   * @param  {[type]}   limit    []
   * @param  {Function} callback []
   * @return {[type]}            []
   */
  init(limit, callback){
    if(think.isFunction(limit)){
      callback = limit;
      limit = 0;
    }
    this.limit = limit || 10;
    this.index = 0;
    this.doing = 0;
    this.callback = callback;
    this.deferreds = [];
  }
  /**
   * add item data
   * @param {data} item []
   */
  add(item){
    let deferred = think.defer();
    deferred.data = item;
    this.deferreds.push(deferred);
    this.run();
    return deferred.promise;
  }
  /**
   * add many data once
   * @param {Array} dataList [data array]
   */
  addMany(dataList, ignoreError){
    if (think.isEmpty(dataList)) {
      return Promise.resolve();
    }
    let promises = dataList.map(item => {
      let promise = this.add(item);
      return ignoreError ? promise.catch(() => {}) : promise;
    });
    return Promise.all(promises);
  }
  /**
   * next
   * @return {Function} [description]
   */
  next(){
    this.doing --;

    //reduce deferreds avoid memory leak when use single item data
    this.deferreds.splice(this.index - 1, 1);
    this.index--;

    this.run();
  }
  /**
   * run
   * @return {} []
   */
  run(){
    if (this.doing >= this.limit || this.index >= this.deferreds.length) {
      return;
    }
    this.doing++;
    let item = this.deferreds[this.index++];
    let callback = think.isFunction(item.data) ? item.data : this.callback;
    if (!think.isFunction(callback)) {
      throw new Error('data item or callback must be a function');
    }
    let result = callback(item.data);
    if (!think.isPromise(result)) {
      result = Promise.resolve(result);
    }
    return result.then(data => {
      this.next();
      //resolve item
      item.resolve(data);
    }).catch(err => {
      this.next();
      //reject item
      item.reject(err);
    });
  }
}