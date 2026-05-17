const text = require('./text.js');
const xml2js = require('xml2js');

module.exports = async(ctx, opts) => {
  const xml = await text(ctx, opts);
  const post = await (new xml2js.Parser(opts)).parseStringPromise(xml);
  return { post, raw: xml };
};
