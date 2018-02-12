const utils = require('./utils.js');
const config = require('../config/config.default.js');

module.exports = (options = {}) => {
  options = Object.assign(config, options);

  return (ctx, next) => {
    const method = ctx.method;
    const methods = ['GET', 'HEAD', 'OPTIONS', 'TRACE', 'WEBSOCKET', 'CLI'];
    if (methods.some(item => item === method)) {
      return utils
        .ensureCsrfToken(ctx, options)
        .then(utils.assignCsrf(ctx))
        .then(_ => next());
    }

    return utils
      .checkCsrf(ctx, options)
      .then(() => next())
      .catch(() => {
        ctx.status = options.errno;
        ctx.message = options.errmsg;
      });
  };
};
