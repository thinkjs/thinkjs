const debug = require('debug')('think-router-rest');

module.exports = options => {
  const _REST = options.restConstName || '_REST';
  const _method = options.methodConstName || '_method';

  return (ctx, next) => {
    const {app, module, controller: controllerName} = ctx;

    let controllers = app.controllers;
    if (app.modules.length) {
      controllers = controllers[module];
    }
    const controller = controllers[controllerName];

    if (!controller || !controller[_REST]) {
      debug(`_REST: ${ctx.controller} is not rest controller`);
      return next();
    }

    let actionName = ctx.method;
    const methodName = controller[_method];
    /* just allow custom method in post or cli request */
    debug(`_method: method=${actionName}, methodName = ${methodName}`);
    const isAllowedMethod = ['POST', 'CLI'].indexOf(actionName) > -1;
    if (isAllowedMethod && methodName && ctx.query[methodName]) {
      actionName = ctx.query[methodName];
    }
    debug(`router-rest: controller=${ctx.controller}, action=${ctx.action}`);
    ctx.action = actionName.toLowerCase();
    return next();
  };
};
