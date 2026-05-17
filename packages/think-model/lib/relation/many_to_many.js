function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const BaseRelation = require('./base.js');
const helper = require('think-helper');

module.exports = class ManyToManyRelation extends BaseRelation {
  /**
   * get relation table name
   * @param  {Object} model []
   * @return {}       []
   */
  getRelationModelName() {
    const table = `${this.model.modelName}_${this.options.model.modelName}`;
    return table.toLowerCase();
  }
  /**
   * relation on select or find
   */
  getRelationData() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const where = _this.parseRelationWhere('b.');
      if (where === false) return _this.data;
      const relationModel = _this.options.rModel || _this.getRelationModelName();
      const rfKey = _this.options.rfKey || `${_this.options.model.modelName}_id`;
      const addField = `b.${_this.options.fKey}`;
      let field = _this.options.model.options.field || '*';
      if (helper.isString(field)) {
        field += ',' + addField;
      } else if (helper.isArray(field)) {
        field.push(addField);
      } else if (helper.isObject(field)) {
        field[addField] = _this.options.fKey;
      }
      const mapData = yield _this.options.model.field(field).alias('a').where(where).join({
        [relationModel]: {
          table: `${_this.model.tablePrefix}relationModel`,
          as: 'b',
          join: 'inner',
          on: [_this.options.model.pk, rfKey]
        }
      }).select();
      return _this.parseRelationData(mapData, true);
    })();
  }

  /**
   * relation on add, update, delete
   */
  setRelationData(type) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const relationModelName = _this2.options.rModel || _this2.getRelationModelName();
      const relationModel = _this2.model.model(relationModelName);
      relationModel.db(_this2.model.db());

      const where = { [_this2.options.fKey]: _this2.data[_this2.options.key] };
      yield relationModel.where(where).delete();

      if (type === 'DELETE') {
        return true;
      }

      let data = _this2.data[_this2.options.name];
      if (helper.isEmpty(data)) {
        return;
      }
      if (!helper.isArray(data)) {
        data = [data];
      }
      const rfKey = _this2.options.rfKey || `${_this2.options.model.modelName}_id`;

      if (helper.isNumberString(data[0]) || helper.isObject(data[0]) && rfKey in data[0]) {
        data = data.map(function (val) {
          return {
            [_this2.options.fKey]: _this2.data[_this2.options.key],
            [rfKey]: val[rfKey] || val
          };
        });
        return relationModel.addMany(data);
      }
    })();
  }
};