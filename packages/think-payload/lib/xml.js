const text = require('./text.js');
const parser = require('xml2json');

exports.before = ctx => {
  return text.before(ctx).then(parser.toJson).then(JSON.parse);
};