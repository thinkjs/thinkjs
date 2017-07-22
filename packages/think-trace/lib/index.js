const helper = require('think-helper');
const sourceMapSupport = require('source-map-support');
const Tracer = require('./tracer');

module.exports = function(opts) {
  const tracer = new Tracer(opts);

  // source map support for compiled file
  if (opts && opts.sourceMap !== false) {
    sourceMapSupport.install();
  }

  let errorCallback;
  if (opts && helper.isFunction(opts.error)) {
    errorCallback = opts.error;
  } else {
    errorCallback = console.error.bind(console);
  }

  return (ctx, next) =>
    tracer.getTemplateContent()
      .then(next)
      .then(() => {
        if (ctx.res.statusCode !== 404) {
          return true;
        }

        return ctx.throw(404, `url \`${ctx.path}\` not found.`);
      })
      .catch(err => {
        errorCallback(err);
        return tracer.run(ctx, err);
      });
};
