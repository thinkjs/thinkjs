const Abstract = require('think-model-abstract');
const Query = require('./lib/query.js');
const Schema = require('./lib/schema.js');
const Parser = require('./lib/parser.js');

module.exports = class SQLiteAdapter extends Abstract {};

module.exports.Query = Query;
module.exports.Parser = Parser;
module.exports.Schema = Schema;
