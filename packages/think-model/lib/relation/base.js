const helper = require('think-helper');
/**
 * Abstract Relation class
 */
module.exports = class BaseRelation {
  /**
   * constructor
   * @param {Object|Array} data
   * @param {Object} options
   * @param {Object} model
   */
  constructor(data, options, model) {
    this.data = data;
    this.options = options;
    this.model = model;
  }
  /**
   * parse where in relation model
   */
  parseRelationWhere() {
    const { key, fKey } = this.options;
    if (helper.isArray(this.data)) {
      const keys = [];
      this.data.forEach(item => {
        let itemValue = item[key];
        if (itemValue !== 0 && !itemValue) return;
        if (helper.isNumberString(itemValue)) itemValue = parseInt(itemValue, 10);
        if (keys.indexOf(itemValue) === -1) keys.push(itemValue);
      });
      if (keys.length === 0) return false;
      return {
        [fKey]: ['IN', keys]
      };
    }
    if (!this.data[key]) return false;
    return {
      [fKey]: this.data[key]
    };
  }
  /**
   * merge relation data to data
   * @param {Object} mapData
   * @param {Boolean} isArrMap
   */
  parseRelationData(mapData, isArrMap) {
    if (helper.isArray(this.data)) {
      if (isArrMap) {
        this.data.forEach((item, i) => {
          this.data[i][this.options.name] = [];
        });
      }

      const dataMap = {};
      for (const item of mapData) {
        const key = item[this.options.fKey];
        if (helper.isArray(dataMap[key])) {
          dataMap[key].push(item);
        } else {
          dataMap[key] = isArrMap ? [item] : item;
        }
      }

      for (let i = 0; i < this.data.length; i++) {
        const key = this.data[i][this.options.key];
        if (!dataMap[key]) {
          continue;
        }
        this.data[i][this.options.name] = dataMap[key];
      }
    } else {
      this.data[this.options.name] = isArrMap ? mapData : mapData[0] || {};
    }
    return this.data;
  }
};