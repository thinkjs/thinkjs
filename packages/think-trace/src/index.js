const Tracer = require('./tracer');

module.exports = function(opts) {
  let tracer = new Tracer(opts);
  return (ctx, next) => 
    tracer.getTemplateContent()
    .then(next)
    .catch(err => tracer.run(ctx, err));
}