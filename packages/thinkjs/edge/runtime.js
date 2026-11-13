import helper from 'think-helper/pure.js';
import createThink from '../lib/core/think.js';
import CoreLoader from '../lib/core/loader.js';
import {Context} from './context.js';
import {ManifestLoader} from './loader.js';

const existing = globalThis.think;
// A dormant Node entry may select Edge in Application.run(); keep its base classes.
export const think = existing && existing[Symbol.for('thinkjs.core')] && !existing[Symbol.for('thinkjs.started')]
  ? existing
  : createThink(null, helper);
let activeApplication;

export function installGlobal() {
  if (globalThis.think && globalThis.think !== think) {
    throw new Error(
      'Only one ThinkJS application is supported per edge runtime'
    );
  }
  globalThis.think = think;
  return think;
}

// This is the Fetch equivalent of the Koa transport, not a second ThinkJS core.
function createTransport(options) {
  const listeners = new Map();
  const middleware = [];
  return {
    options,
    think,
    env: options.env || 'production',
    context: Object.create(Context.prototype),
    request: {},
    response: {},
    use(fn) {
      middleware.push(fn);
    },
    on(name, fn) {
      const list = listeners.get(name) || [];
      list.push(fn);
      listeners.set(name, list);
      return this;
    },
    once(name, fn) {
      const wrapper = (...args) => {
        listeners.set(
          name,
          listeners.get(name).filter((item) => item !== wrapper)
        );
        return fn(...args);
      };
      return this.on(name, wrapper);
    },
    emit(name, ...args) {
      for (const listener of [...(listeners.get(name) || [])])
        listener(...args);
    },
    dispatch(ctx) {
      let last = -1;
      const next = (index) => {
        if (index <= last)
          return Promise.reject(new Error('next() called multiple times'));
        last = index;
        return Promise.resolve().then(() =>
          middleware[index]?.(ctx, () => next(index + 1))
        );
      };
      return next(0);
    }
  };
}

export function run(application) {
  if (activeApplication) {
    if (activeApplication === application) return think.app;
    throw new Error(
      'Only one ThinkJS application is supported per edge runtime'
    );
  }
  installGlobal();
  activeApplication = application;
  think[Symbol.for('thinkjs.started')] = true;
  const options = application.options;
  const app = createTransport(options);
  think.app = app;
  think.loader = new ManifestLoader(options.manifest || {});
  think.config = think.loader.createConfig();
  think.logger = options.logger || console;
  const loader = new CoreLoader();
  let ready;
  const initialize = async () => {
    loader.loadExtend();
    loader.loadData();
    loader.loadMiddleware();
    await think.loader.loadBootstrap();
    await think.beforeStartServer();
    app.emit('appReady');
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
              helper.ms(think.config('startServerTimeout'))
            );
          })
        ]).finally(() => clearTimeout(timer));
      }
      await ready;
      const ctx = new Context(app, request, env, executionContext);
      Object.setPrototypeOf(ctx, app.context);
      await ctx.prepare();
      await app.dispatch(ctx);
      return await ctx.toResponse();
    } catch (error) {
      think.logger.error(error);
      const status =
        Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status <= 599
          ? error.status
          : 500;
      return new Response(
        status === 500 ? 'Internal Server Error' : error.message,
        {status}
      );
    }
  };
  return app;
}
