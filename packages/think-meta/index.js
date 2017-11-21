const helper = require('think-helper');
/**
 * default options
 */
const defaultOptions = {
  requestTimeout: 10 * 1000, // request timeout, default is 10s
  requestTimeoutCallback: () => {}, // request timeout callback
  sendPowerBy: true, // send powerby
  sendResponseTime: true, // send response time
  logRequest: true
};

/**
 * send meta middleware
 */
module.exports = (options, app) => {
  options = Object.assign({}, defaultOptions, options);
  options.requestTimeout = helper.ms(options.requestTimeout);

  return (ctx, next) => {
    // set request timeout
    ctx.res.setTimeout(options.requestTimeout, options.requestTimeoutCallback);
    // send power by header
    if (options.sendPowerBy && !ctx.res.headersSent) {
      const version = app.think.version;
      ctx.res.setHeader('X-Powered-By', `thinkjs-${version}`);
    }
    // send response time header
    if (options.sendResponseTime || options.logRequest) {
      const startTime = Date.now();
      let err;
      return next().catch(e => {
        err = e;
      }).then(() => {
        const endTime = Date.now();
        if (options.sendResponseTime && !ctx.res.headersSent) {
          ctx.res.setHeader('X-Response-Time', `${endTime - startTime}ms`);
        }
        if(options.logRequest){
          process.nextTick(() => {
            app.think.logger.info(`${ctx.method} ${ctx.url} ${ctx.status} ${endTime - startTime}ms`);
          });
        }
        if (err) return Promise.reject(err);
      });
    } else {
      return next();
    }
  };
};
