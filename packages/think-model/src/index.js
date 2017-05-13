const Mysql = require('./mysql');
const MysqlRelation = require('./mysql/relation');

Mysql.Relation = MysqlRelation;
module.exports = Mysql;