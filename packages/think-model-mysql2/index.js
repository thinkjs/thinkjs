const Abstract = require('think-model-abstract');
const Query = require('./lib/query.js');
const Schema = require('./lib/schema.js');
const Parser = require('./lib/parser.js');

module.exports = class Mysql extends Abstract {};

module.exports.Query = Query;
module.exports.Schema = Schema;
module.exports.Parser = Parser;
