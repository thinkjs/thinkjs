function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const BaseRelation = require('./base.js');

module.exports = class BelongToRelation extends BaseRelation {
  /**
   * relation on select or find
   */
  getRelationData() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const where = _this.parseRelationWhere();
      if (where === false) return _this.data;
      const mapData = yield _this.options.model.where(where).select();
      return _this.parseRelationData(mapData);
    })();
  }

  /**
   * relation on add, update, delete
   */
  setRelationData() {
    return _asyncToGenerator(function* () {})();
  }
};