const AbstractRelation = require('./abstract.js');

module.exports = class ManyToManyRelation extends AbstractRelation {
  /**
   * get relation table name
   * @param  {Object} model []
   * @return {}       []
   */
  getRelationTableName(model) {
    const table = [
      this.tablePrefix,
      this.tableName || this.name,
      '_',
      model.getModelName()
    ].join('');
    return table.toLowerCase();
  }
  /**
   * get relation
   */
  async getRelation() {
    const where = this.parseRelationWhere();
    let sql = 'SELECT %s, a.%s FROM %s as a, %s as b %s AND a.%s=b.%s %s';
    const field = this.db().parseField(this.options.field).split(',').map(item => `b.${item}`).join(',');
    const pk = this.options.model.getPk();

    let table = this.options.rModel;
    if (table) {
      const tablePrefix = this.model.getTablePrefix();
      if (tablePrefix && table.indexOf(tablePrefix) !== 0) {
        table = tablePrefix + table;
      }
    } else {
      table = this.getRelationTableName(this.options.model);
    }

    const table1 = this.options.model.getTableName();
    const where1 = this.db().parseWhere(where);
    const rkey = this.options.rfKey || (this.options.model.getModelName() + '_id');
    const where2 = this.options.where ? (' AND ' + this.db().parseWhere(this.options.where).trim().slice(6)) : '';
    sql = this.parseSql(sql, field, this.options.fKey, table, table1, where1, rkey, pk, where2);
    const mapData = await this.db().select(sql, this.options.cache);
    return this.parseRelationData(mapData, true);
  }
};
