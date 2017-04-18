const parse = require('./lib/index.js');

module.exports = function (opts) {
  const extendTypes = Object.assign({
    json: [],
    form: [],
    text: [],
  }, opts.extendTypes);

  // default json types
  const jsonTypes = [
    'application/json',
    ...extendTypes.json,
  ];

  // default form types
  const formTypes = [
    'application/x-www-form-urlencoded',
    ...extendTypes.form,
  ];

  // default text types
  const textTypes = [
    'text/plain',
    ...extendTypes.text,
  ];

  return function (ctx, next) {
    if (ctx.request.body !== undefined) return next();

    return parseBody(ctx).then(body => {
      ctx.request.body = body;
      return next();
    }).catch(err => {
      throw err;
    });
  }

  function parseBody(ctx) {
    if (ctx.request.is(jsonTypes)) {
      return parse.json(ctx);
    }
    if (ctx.request.is(formTypes)) {
      return parse.form(ctx);
    }
    if (ctx.request.is(textTypes)) {
      return parse.text(ctx);
    }

    return Promise.resolve({});
  }
};