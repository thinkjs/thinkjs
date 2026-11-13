import {
  helper,
  router,
  controller,
  logic,
  logicMethods,
  controllerMethods,
  configModule,
  pathToRegexp
} from './shared.generated.js';
import {Context} from './context.js';

export class Controller {
  constructor(ctx) {
    this.ctx = ctx;
  }
}
Object.defineProperties(
  Controller.prototype,
  Object.getOwnPropertyDescriptors(controllerMethods)
);
Controller.prototype.header = function (name, value) {
  if (typeof name === 'string' && value === undefined)
    return this.ctx.get(name);
  return this.ctx.set(name, value);
};
for (const method of ['model', 'session', 'cache', 'display', 'render']) {
  Controller.prototype[method] = function () {
    throw new Error(
      `${method} requires an edge-compatible Service or context extension`
    );
  };
}
export class Logic extends Controller {}
Object.defineProperties(
  Logic.prototype,
  Object.getOwnPropertyDescriptors(logicMethods)
);
export class Service {}

const defaults = {
  jsonContentType: 'application/json',
  jsonpContentType: 'application/javascript',
  jsonpCallbackField: 'callback',
  errnoField: 'errno',
  errmsgField: 'errmsg',
  defaultErrno: 1000,
  validateDefaultErrno: 1001,
  startServerTimeout: 3000
};
let activeApp;
const startup = [];
export const think = Object.assign(Object.create(helper), {
  Controller,
  Logic,
  Service,
  logger: console,
  beforeStartServer(fn) {
    if (typeof fn !== 'function')
      throw new TypeError('beforeStartServer requires a function');
    startup.push(Promise.resolve().then(fn));
  },
  service(name, module, ...args) {
    let services = this.app.services;
    if (this.app.modules.length) {
      services = services[module || 'common'] || {};
    } else {
      args.unshift(module);
    }
    const Class = services[name];
    if (!Class) throw new Error(`Cannot find service: ${name}`);
    return typeof Class === 'function' ? new Class(...args) : Class;
  }
});
Object.defineProperty(think, 'env', {get: () => think.app?.env});

export function installGlobal() {
  if (globalThis.think && globalThis.think !== think)
    throw new Error(
      'Only one ThinkJS application is supported per edge runtime'
    );
  globalThis.think = think;
  return think;
}
installGlobal();

function compose(middlewares) {
  return (ctx) => {
    let last = -1;
    const dispatch = (index) => {
      if (index <= last)
        return Promise.reject(new Error('next() called multiple times'));
      last = index;
      return Promise.resolve().then(() =>
        middlewares[index]?.(ctx, () => dispatch(index + 1))
      );
    };
    return dispatch(0);
  };
}

function extend(target, source) {
  if (source)
    Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
}

export function createApp(manifest = {}, options = {}) {
  if (activeApp)
    throw new Error(
      'Only one ThinkJS application is supported per edge runtime'
    );
  installGlobal();
  const listeners = new Map();
  const app = {
    options,
    think,
    env: options.env || 'production',
    modules: manifest.modules || [],
    controllers: manifest.controllers || {},
    logics: manifest.logics || {},
    services: manifest.services || {},
    validators: manifest.validators || {},
    routers: helper.extend(
      Array.isArray(manifest.routers ?? []) ? [] : {},
      manifest.routers || []
    ),
    context: Object.create(Context.prototype),
    on(name, fn) {
      const list = listeners.get(name) || [];
      list.push(fn);
      listeners.set(name, list);
      return app;
    },
    once(name, fn) {
      const wrapper = (...args) => {
        listeners.set(
          name,
          listeners.get(name).filter((item) => item !== wrapper)
        );
        return fn(...args);
      };
      return app.on(name, wrapper);
    },
    emit(name, ...args) {
      for (const listener of [...(listeners.get(name) || [])])
        listener(...args);
    }
  };
  const configs = {};
  if (app.modules.length) {
    for (const module of app.modules)
      configs[module] = helper.extend({}, defaults, manifest.config?.[module]);
  }
  think.app = app;
  think.config = configModule.getConfigFn(
    app.modules.length ? configs : helper.extend({}, defaults, manifest.config),
    Boolean(app.modules.length)
  );
  think.logger = options.logger || console;
  activeApp = app;
  const extensions = manifest.extensions || {};
  for (const name of Object.keys(extensions)) {
    if (!['think', 'application', 'context', 'controller', 'logic', 'service', 'request', 'response'].includes(name)) {
      throw new Error(`Unsupported edge extension: ${name}`);
    }
  }
  for (const [name, target] of Object.entries({
    think,
    application: app,
    context: app.context,
    controller: Controller.prototype,
    logic: Logic.prototype,
    service: Service.prototype
  })) {
    extend(target, extensions[name]);
  }
  if (extensions.request || extensions.response)
    throw new Error(
      'Edge request/response extensions are unsupported; extend context instead'
    );
  let ready;
  let execute;
  const initialize = async () => {
    const builtins = {router, logic, controller};
    const registry = {...builtins, ...manifest.middleware};
    const stack = [];
    for (let entry of manifest.middlewares || [
      'router',
      'logic',
      'controller'
    ]) {
      if (typeof entry === 'function') {
        stack.push(entry);
        continue;
      }
      if (typeof entry === 'string') entry = {handle: entry};
      if (entry.enable === false) continue;
      let handle = entry.handle;
      // Request preparation and exception handling are intrinsic to Fetch dispatch.
      if (['payload', 'trace', 'meta'].includes(handle)) {
        if (entry.options && Object.keys(entry.options).length) {
          throw new Error(
            `Configure ${handle} through EdgeOptions; legacy middleware options are unsupported`
          );
        }
        continue;
      }
      if (typeof handle === 'string') handle = registry[handle];
      if (typeof handle !== 'function')
        throw new Error(`Unsupported edge middleware: ${entry.handle}`);
      const settings =
        typeof entry.options === 'function'
          ? await entry.options()
          : entry.options || {};
      const middleware = handle(settings, app);
      if (typeof middleware !== 'function')
        throw new TypeError('Middleware factory must return a function');
      const match =
        typeof entry.match === 'function'
          ? entry.match
          : entry.match
            ? (ctx) => pathToRegexp(entry.match).test(ctx.path)
            : null;
      const ignore =
        typeof entry.ignore === 'function'
          ? entry.ignore
          : entry.ignore
            ? (ctx) => pathToRegexp(entry.ignore).test(ctx.path)
            : null;
      stack.push((ctx, next) =>
        (match && !match(ctx)) || (ignore && ignore(ctx))
          ? next()
          : middleware(ctx, next)
      );
    }
    for (const bootstrap of manifest.bootstrap || []) {
      const exported = await bootstrap();
      if (typeof exported === 'function') await exported(think);
    }
    for (let index = 0; index < startup.length; index++) {
      await startup[index];
    }
    app.emit('appReady');
    execute = compose(stack);
  };
  app.fetch = async (request, env = {}, executionContext) => {
    try {
      if (!ready) {
        let timer;
        ready = Promise.race([
          Promise.resolve().then(initialize),
          new Promise((resolve, reject) => {
            timer = setTimeout(
              () =>
                reject(new Error('Edge application initialization timed out')),
              think.config('startServerTimeout')
            );
          })
        ]).finally(() => clearTimeout(timer));
      }
      await ready;
      const ctx = new Context(app, request, env, executionContext);
      Object.setPrototypeOf(ctx, app.context);
      await ctx.prepare();
      await execute(ctx);
      return await ctx.toResponse();
    } catch (error) {
      think.logger.error(error);
      const status =
        Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status <= 599
          ? error.status
          : 500;
      const message = status === 500 ? 'Internal Server Error' : error.message;
      return new Response(message, {status});
    }
  };
  return app;
}
