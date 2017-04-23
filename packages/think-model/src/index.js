const Mysql = require('./mysql');
const MysqlRelation = require('./mysql/relation');

module.exports = {
  Base: Mysql,
  Relation: MysqlRelation
};