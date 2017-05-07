const text = require('./text.js');
const helper = require('think-helper');
const parseString = require('xml2js').parseString;
const parser = helper.promisify(parseString, parseString);


exports.before = ctx => text.before(ctx).then(parser);