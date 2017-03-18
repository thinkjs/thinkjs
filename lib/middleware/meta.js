
/**
 * default options
 */
const defaultOptions = {
  requestTimeout: 10 * 1000, //request timeout, default is 10s
  requestTimeoutCallback: () => {}, //request timeout callback
  sendPowerBy: true, 
  sendExecTime: true
}

/**
 * send meta middleware
 */
module.exports = (options, app) => {
  options = Object.assign({}, defaultOptions, options);
  return (ctx, next) => {
    //set request timeout
    ctx.res.setTimeout(options.requestTimeout, options.requestTimeoutCallback);
    //send power by header
    if(options.sendPowerBy){
      const version = app.think.version;
      ctx.res.setHeader('X-Powered-By', `thinkjs-${version}`);
    }
    //send exec time header
    if(options.sendExecTime){
      const startTime = Date.now();
      let err;
      return next().catch(e => {
        err = e;
      }).then(() => {
        const endTime = Date.now();
        ctx.res.setHeader('X-Exec-Time', `${endTime - startTime}ms`);
        if(err) return Promise.reject(err);
      })
    }else{
      return next();
    }
  }
}