import helper from 'think-helper/pure.js';
import config from 'think-config';
import Middleware from 'think-loader/middleware.js';
import extend from 'think-loader/extend.js';
import router from 'think-router';
import logic from 'think-logic';
import controller from 'think-controller';
import defaults from '../lib/config/config.js';
import contextMethods from '../lib/core/context.js';
import controllerMethods from '../lib/extend/controller.js';
import logicMethods from '../lib/extend/logic.js';

function intrinsic(options) {
  if (Object.keys(options).length) {
    throw new Error(
      'Configure payload/trace/meta through EdgeOptions; legacy middleware options are unsupported'
    );
  }
  return (ctx, next) => next();
}

// Same loader interface as think-loader; only discovery differs (static vs fs).
export class ManifestLoader {
  constructor(manifest) {
    this.manifest = manifest;
    this.modules = manifest.modules || [];
  }
  createConfig() {
    const values = {};
    if (this.modules.length) {
      for (const module of this.modules) {
        values[module] = helper.extend(
          {},
          defaults,
          this.manifest.config?.[module]
        );
      }
    }
    return config.getConfigFn(
      this.modules.length
        ? values
        : helper.extend({}, defaults, this.manifest.config),
      Boolean(this.modules.length)
    );
  }
  loadModel() {
    return {};
  }
  loadService() {
    return this.manifest.services || {};
  }
  loadLogic() {
    return this.manifest.logics || {};
  }
  loadController() {
    return this.manifest.controllers || {};
  }
  loadRouter() {
    return helper.extend(
      Array.isArray(this.manifest.routers || []) ? [] : {},
      this.manifest.routers || []
    );
  }
  loadValidator() {
    return this.manifest.validators || {};
  }
  loadExtend() {
    const result = {context: {}, controller: {}, logic: {}};
    extend(result.context, contextMethods);
    extend(result.controller, controllerMethods);
    extend(result.logic, logicMethods);
    for (const name of ['model', 'session', 'cache', 'display', 'render']) {
      result.controller[name] = function () {
        throw new Error(
          `${name} requires an edge-compatible Service or extension`
        );
      };
    }
    for (const [name, value] of Object.entries(
      this.manifest.extensions || {}
    )) {
      if (
        ![
          'think',
          'application',
          'context',
          'controller',
          'logic',
          'service'
        ].includes(name)
      ) {
        throw new Error(`Unsupported edge extension: ${name}`);
      }
      result[name] ||= {};
      extend(result[name], value);
    }
    return result;
  }
  loadMiddleware(app) {
    const registry = {
      router,
      logic,
      controller,
      payload: intrinsic,
      trace: intrinsic,
      meta: intrinsic,
      ...this.manifest.middleware
    };
    return new Middleware().parse(
      this.manifest.middlewares || ['router', 'logic', 'controller'],
      registry,
      app
    );
  }
  async loadBootstrap() {
    for (const load of this.manifest.bootstrap || []) {
      const value = await load();
      if (typeof value === 'function') await value(globalThis.think);
    }
  }
}
