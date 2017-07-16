const utils = require('./utils.js');
const config = require('../config/config.default.js');

module.exports = (options = {}) => {
  options = Object.assign(config, options);

  return (ctx, next) => {
    const method = ctx.method;
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'TRACE') {
      return utils.ensureCsrfToken(ctx, options).then(utils.assignCsrf(ctx)).then(() => next());
    }

    return utils.checkCsrf(ctx, options).then(() => next()).catch(() => {
      ctx.status = options.errno;
      ctx.message = options.errmsg;
    });
  };
};
