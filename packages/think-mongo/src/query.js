const helper = require('think-helper');
const Socket = require('./socket.js');
const Parser = require('./parser.js');

const SOCKET = Symbol('think-mongo-socket');
const PARSER = Symbol('think-mongo-parser');

module.exports = class Query {
  constructor(config) {
    this.config = config;
    this.lastInsertId = '';
  }
  /**
   * get socket instance
   */
  get socket() {
    if (this[SOCKET]) return this[SOCKET];
    this[SOCKET] = new Socket(this.config);
    return this[SOCKET];
  }
  /**
   * get parser instance
   */
  get parser() {
    if (this[PARSER]) return this[PARSER];
    this[PARSER] = new Parser();
    return this[PARSER];
  }
  /**
   * add data
   * @param {Object} data 
   * @param {Object} options 
   */
  add(data, options) {
    return this.socket.autoRelease(async connection => {
      const collection = connection.collection(options.table);
      await collection.insert(data);
      this.lastInsertId = data._id.toString();
      return this.lastInsertId;
    });
  }
  /**
   * add data list
   * @param {Array} dataList 
   * @param {Object} options 
   */
  addMany(dataList, options) {
    return this.socket.autoRelease(async connection => {
      const collection = connection.collection(options.table);
      await collection.insert(dataList, options);
      const insertedIds = dataList.map(item => {
        return item._id.toString();
      });
      this.lastInsertId = insertedIds;
      return this.lastInsertId;
    });
  }
  /**
   * set collection limit
   * @param  {Object} collection []
   * @param  {String} limit      []
   * @return {Object}            []
   */
  limit(collection, limit) {
    limit = this.parser.parseLimit(limit);
    if (limit[0]) {
      collection.skip(limit[0]);
    }
    if (limit[1]) {
      collection.limit(limit[1]);
    }
    return collection;
  }
  /**
   * parse group
   * @param  {String} group []
   * @return {Object}       []
   */
  group(group) {
    group = this.parser.parseGroup(group);
    const length = group.length;
    if (length === 0) {
      return {_id: null};
    } else if (length === 1) {
      return {_id: `$${group[0]}`};
    } else {
      const result = {};
      group.forEach(item => {
        result[item] = `$${item}`;
      });
      return result;
    }
  }
  /**
   * select data
   * @param {Object} options 
   */
  select(options) {
    const where = this.parser.parseWhere(options.where);
    const distinct = this.parser.parseDistinct(options.distinct);
    const field = this.parser.parseField(options.field);
    const order = this.parser.parseOrder(options.order);

    return this.socket.autoRelease(connection => {
      let collection = connection.collection(options.table);
      if (distinct) {
        collection.distinct(distinct, where);
      }
      collection = collection.find(where, field);
      collection = this.limit(collection, options.limit);
      collection = collection.sort(order);
      return collection.toArray();
    });
  }
  /**
   * update data
   * @param {Object} data 
   * @param {Object} options 
   */
  update(data, options) {
    const where = this.parser.parseWhere(options.where);
    const limit = this.parser.parseLimit(options.limit);

    return this.socket.autoRelease(connection => {
      const collection = connection.collection(options.table);
      // updates multiple documents that meet the query criteria. 
      // default only updates one document
      if (limit[1] !== 1) {
        options.multi = true;
      }
      // If set to true, creates a new document when no document matches the query criteria. 
      // The default value is false, which does not insert a new document when no match is found.
      if (!options.upsert) {
        options.upsert = false;
      }
      // add $set for data
      let flag = true;
      for (const key in data) {
        if (key[0] !== '$') {
          flag = false;
          break;
        }
      }
      if (!flag) {
        data = {$set: data};
      }
      // update operator
      // http://docs.mongodb.org/manual/reference/operator/update/#id1
      return collection.update(where, data, options);
    });
  }
  /**
   * delete data
   * @param {Object} options 
   */
  delete(options) {
    const where = this.parser.parseWhere(options.where);
    const limit = this.parser.parseLimit(options.limit);

    // delete one row
    const removeOpt = {};
    if (limit[1] === 1) {
      removeOpt.justOne = true;
    }

    return this.socket.autoRelease(connection => {
      const collection = connection.collection(options.table);
      return collection.remove(where, removeOpt);
    });
  }
  /**
   * get data count
   * @param {Object} options 
   */
  count(options) {
    const where = this.parser.parseWhere(options.where);
    const aggregate = [];
    if (!think.isEmpty(where)) {
      aggregate.push({$match: where});
    }

    const group = this.group(options.group);
    group.total = {$sum: 1};
    aggregate.push({$group: group});

    const order = this.parser.parseOrder(options.order);
    if (!think.isEmpty(order)) {
      aggregate.push({$sort: order});
    }

    return this.socket.autoRelease(connection => {
      const collection = connection.collection(options.table);
      // make aggregate method to be a promise
      const fn = helper.promisify(collection.aggregate, collection);
      return fn(aggregate).then(data => {
        return (data[0] && data[0].total) || 0;
      });
    });
  }
  /**
   * get data sum
   * @param {Object} options 
   */
  sum(options) {
    const where = this.parser.parseWhere(options.where);
    const group = this.group(options.group);
    group.total = {$sum: `$${options.field}`};
    const order = this.parser.parseOrder(options.order);

    const aggregate = [];
    if (!helper.isEmpty(where)) {
      aggregate.push({$match: where});
    }
    aggregate.push({$group: group});
    if (!think.isEmpty(order)) {
      aggregate.push({$sort: order});
    }

    return this.socket.autoRelease(connection => {
      const collection = connection.collection(options.table);
      // make aggregate method to be a promise
      const fn = think.promisify(collection.aggregate, collection);
      return fn(aggregate).then(data => {
        return (data[0] && data[0].total) || 0;
      });
    });
  }
  /**
   * create collection indexes
   * @param  {String} table   []
   * @param  {Object} indexes []
   * @return {Promise}         []
   */
  ensureIndex(table, indexes, options = {}) {
    if (options === true) {
      options = {unique: true};
    }
    if (helper.isString(indexes)) {
      indexes = indexes.split(/\s*,\s*/);
    }
    if (think.isArray(indexes)) {
      const result = {};
      indexes.forEach(item => {
        result[item] = 1;
      });
      indexes = result;
    }
    return this.socket.autoRelease(connection => {
      const collection = connection.collection(table);
      return collection.ensureIndex(indexes, options);
    });
  }
  /**
   * aggregate
   * @param  {String} table   []
   * @param  {Object} options []
   * @return {Promise}         []
   */
  aggregate(table, options) {
    return this.socket.autoRelease(connection => {
      const collection = connection.collection(table);
      const fn = think.promisify(collection.aggregate, collection);
      return fn(options);
    });
  }
};
