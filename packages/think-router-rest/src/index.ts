import createDebug = require('debug');

const debug = createDebug('think-router-rest');

interface Options {
  restConstName?: string;
  methodConstName?: string;
}

interface Context {
  app: {
    modules: readonly string[];
    // Controller registries may contain classes or objects, with an extra
    // module level. Inspect dynamic static flags only at the runtime boundary.
    controllers: object;
  };
  module?: string;
  controller: string;
  method: string;
  action?: string;
  // HTTP query values are not validated by this middleware.
  query?: object;
}

interface Middleware {
  <T>(ctx: Context, next: () => T): T;
}

export = (options: Options): Middleware => {
  const _REST = options.restConstName || '_REST';
  const _method = options.methodConstName || '_method';

  return (ctx, next) => {
    const {app, module, controller: controllerName} = ctx;

    let controllers = app.controllers as Record<string, unknown>;
    if (app.modules.length) {
      controllers = controllers[module as string] as Record<string, unknown>;
    }
    const controller = controllers[controllerName] as Record<string, unknown> | undefined;

    if (!controller || !controller[_REST]) {
      debug(`_REST: ${ctx.controller} is not rest controller`);
      return next();
    }

    let actionName = ctx.method;
    const methodName = controller[_method] as string;
    /* just allow custom method in post or cli request */
    debug(`_method: method=${actionName}, methodName = ${methodName}`);
    const isAllowedMethod = ['POST', 'CLI'].indexOf(actionName) > -1;
    if (isAllowedMethod && methodName && (ctx.query as Record<PropertyKey, unknown>)[methodName]) {
      actionName = (ctx.query as Record<PropertyKey, unknown>)[methodName] as string;
    }
    debug(`router-rest: controller=${ctx.controller}, action=${ctx.action}`);
    // Preserve legacy non-strict writes to frozen/accessor/proxy contexts.
    // Do not await or wrap next(): callers receive its exact result or error.
    Reflect.set(Object(ctx), 'action', actionName.toLowerCase(), ctx);
    return next();
  };
};
