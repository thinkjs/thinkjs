const qs = require('qs');

const defaultOptions = {
  query: true,
  post: true
};

module.exports = options => {
  options = Object.assign({}, defaultOptions, options);
  return (ctx, next) => {
    if (options.query) {
      const querystring = ctx.request.querystring;
      const obj = qs.parse(querystring, options);
      ctx.request._query = obj;
    }
    const body = ctx.request.body;
    if (options.post && body && body.post) {
      const flag = Object.keys(body.post).some(item => {
        return item.indexOf('[') > -1 && item.indexOf(']') > -1;
      });
      if (!flag) return next();
      const obj = qs.parse(qs.stringify(body.post), options);
      body.post = obj;
    }
    return next();
  };
};
