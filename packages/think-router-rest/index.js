const debug = require('debug')('think-router-rest');

module.exports = options => {
  const _REST = options.restConstName || '_REST';
  const _method = options.methodConstName || '_method';

  return (ctx, next) => {
    const controller = ctx.app.controllers[ctx.controller];
    if (!controller || !controller[_REST]) {
      debug(`_REST: ${ctx.controller} is not rest controller`);
      return next();
    }

    let actionName = ctx.method;
    const methodName = controller[_method];
    /* just allow custom method in post request */
    debug(`_method: method=${actionName}, methodName = ${methodName}`);
    if (actionName === 'POST' && methodName && ctx.query[methodName]) {
      actionName = ctx.query[methodName];
    }
    debug(`router-rest: controller=${ctx.controller}, action=${ctx.action}`);
    ctx.action = actionName.toLowerCase();
    return next();
  };
};
