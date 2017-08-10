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
  async getRelation() {
    const where = this.parseRelationWhere();
    if (where === false) return this.data;
    const relationModel = this.options.rModel || this.getRelationModelName();
    const rfKey = this.options.rfKey || `${this.options.model.modelName}_id`;
    const addField = `b.${this.options.fKey}`;
    let field = this.options.model.options.field || '*';
    if (helper.isString(field)) {
      field += ',' + addField;
    } else if (helper.isArray(field)) {
      field.push(addField);
    } else if (helper.isObject(field)) {
      field[addField] = this.options.fKey;
    }
    const mapData = await this.options.model.field(field).alias('a').where(where).join({
      [relationModel]: {
        table: `${this.model.tablePrefix}relationModel`,
        as: 'b',
        join: 'inner',
        on: [this.options.model.pk, rfKey]
      }
    }).select();
    return this.parseRelationData(mapData, true);
  }
};
