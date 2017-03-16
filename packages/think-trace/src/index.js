const sourceMapSupport = require('source-map-support');
const Tracer = require('./tracer');

module.exports = function(opts) {
  let tracer = new Tracer(opts);

  // source map support for compiled file
  if( opts.sourceMap !== false ) {
    sourceMapSupport.install();
  }

  return (ctx, next) => 
    tracer.getTemplateContent()
    .then(next)
    .then(() => tracer.is404(ctx))
    .catch(err => tracer.run(ctx, err));
}