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
    const key = this.options.key;
    const fKey = this.options.fKey;
    if (helper.isArray(this.data)) {
      const keys = [];
      this.data.forEach(item => {
        if (keys.indexOf(item[key]) === -1 && item[key]) {
          keys.push(item[key]);
        }
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
      mapData.forEach(mapItem => {
        this.data.forEach((item, i) => {
          if (mapItem[this.options.fKey] !== item[this.options.key]) {
            return;
          }
          if (isArrMap) {
            this.data[i][this.options.name].push(mapItem);
          } else {
            this.data[i][this.options.name] = mapItem;
          }
        });
      });
    } else {
      this.data[this.options.name] = isArrMap ? mapData : (mapData[0] || {});
    }
    return this.data;
  }
};
