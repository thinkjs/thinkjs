const AbstractRelation = require('./abstract.js');

module.exports = class BelongToRelation extends AbstractRelation {
  async getRelation() {
    const where = this.parseRelationWhere();
    const mapData = await this.options.model.where(where).select();
    return this.parseRelationData(mapData);
  }
};
