const BaseRelation = require('./base.js');

module.exports = class BelongToRelation extends BaseRelation {
  async getRelation() {
    const where = this.parseRelationWhere();
    const mapData = await this.options.model.where(where).select();
    return this.parseRelationData(mapData);
  }
};
