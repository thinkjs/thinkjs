const text = require('./text.js');
const helper = require('think-helper');
const parseString = require('xml2js').parseString;
const parser = helper.promisify(parseString, parseString);

module.exports = (ctx, opts) => text(ctx, opts)
  .then(xml => parser(xml, opts))
  .then(data => ({post: data}));
