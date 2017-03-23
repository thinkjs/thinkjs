const sourceMapSupport = require('source-map-support');
const Tracer = require('./tracer');

module.exports = function(opts) {
  let tracer = new Tracer(opts);

  // source map support for compiled file
  if( opts && opts.sourceMap !== false ) {
    sourceMapSupport.install();
  }

  return (ctx, next) => 
    tracer.getTemplateContent()
    .then(next)
    .then(() => {
      if( ctx.res.statusCode !== 404 ) {
        return true;
      }

      return ctx.throw(404, `url \`${ctx.path}\` not found.`);
    })
    .catch(err => tracer.run(ctx, err));
}