import helper = require('think-helper');

// A CommonJS namespace preserves the two named runtime exports without adding
// a default export or an __esModule marker, and supports named type imports.
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace thinkConfig {
  export type ConfigValues = Record<string, unknown>;
  export type DefinedValue = object | string | number | boolean | symbol | bigint | null;

  /** Mutable/dynamic paths deliberately return unknown, not a stale schema type. */
  export interface ConfigFn {
    (): ConfigValues;
    (name: undefined | null | '', value?: undefined, module?: string | boolean | null): ConfigValues;
    (name: string | null | undefined, value?: undefined, module?: string | boolean | null): unknown;
    (name: string, value: DefinedValue, module?: string | true): Config | void;
    (name: string, value: unknown, module?: string | true): unknown;
  }

  export interface SingleConfigFn {
    (): ConfigValues;
    (name: undefined | null | '', value?: undefined, module?: unknown): ConfigValues;
    (name: string | null | undefined, value?: undefined, module?: unknown): unknown;
    // undefined means read, while every other value means write.
    (name: string, value: DefinedValue, module?: unknown): Config;
    (name: string, value: unknown, module?: unknown): unknown;
  }

  export interface MultiConfigFn {
    (): ConfigValues;
    (name: undefined | null | '', value?: undefined, module?: string | boolean | null): ConfigValues;
    (name: string | null | undefined, value?: undefined, module?: string | boolean | null): unknown;
    (name: string, value: DefinedValue, module?: string | true): void;
    (name: string, value: unknown, module?: string | true): unknown;
  }

  export class Config {
    config: ConfigValues;

    constructor(config: object = {}) {
      this.config = config as ConfigValues;
    }

    get(): ConfigValues;
    get(name: undefined | null | '', config?: object | null): ConfigValues;
    get(name: string | null | undefined, config?: object | null): unknown;
    get(name?: string | null, config?: object | null): unknown {
      if (!name) {
        return this.config;
      }
      config = config || this.config;
      if (name.indexOf('.') === -1) {
        return (config as ConfigValues)[name];
      }
      const names = name.split('.');
      const length = names.length;
      // Configs may contain arbitrary values. Keep the original lookup and
      // helper.isObject boundary; assertions must not add runtime coercion.
      let current: unknown = config;
      names.some((item, index) => {
        current = (current as ConfigValues)[item];
        if (index !== length - 1 && !helper.isObject(current)) {
          current = undefined;
          return true;
        }
      });
      return current;
    }

    set(name: string, value: unknown): this {
      if (name.indexOf('.') === -1) {
        this.config[name] = value;
        return this;
      }
      let config = this.config;
      const names = name.split('.');
      // Preserve the existing filter exactly; security/behavior changes belong
      // in a separate fix, not in this source-language migration.
      if (names.some(item => /^__proto__|prototype|construcotr$/.test(item))) {
        return this;
      }
      const length = names.length;
      names.forEach((item, index) => {
        if (index === length - 1) {
          config[item] = value;
        } else {
          if (!helper.isObject(config[item])) {
            config[item] = {};
          }
          config = config[item] as ConfigValues;
        }
      });
      return this;
    }
  }

  export function getConfigFn(configs: object, isMultiModule?: false): SingleConfigFn;
  export function getConfigFn(configs: object, isMultiModule: true): MultiConfigFn;
  export function getConfigFn(configs: object, isMultiModule: boolean | undefined): ConfigFn;
  export function getConfigFn(configs: object, isMultiModule?: boolean): unknown {
    const configInstances: Record<string, Config> = {};
    if (isMultiModule) {
      for (const name in configs) {
        configInstances[name] = new Config((configs as Record<string, object>)[name]);
      }
    } else {
      configInstances.common = new Config(configs);
    }
    return (name?: string | null, value?: unknown, m: string | boolean | null = 'common') => {
      let conf = configInstances.common;
      if (!isMultiModule) {
        if (value === undefined) {
          return conf.get(name);
        }
        return conf.set(name as string, value);
      }
      if (value === undefined) {
        if (m && configInstances[m as string]) {
          conf = configInstances[m as string];
        }
        return conf.get(name);
      }
      if (m === true) {
        for (const mName in configInstances) {
          configInstances[mName].set(name as string, value);
        }
        return;
      }
      (m as string).split(',').forEach(item => {
        const conf = configInstances[item];
        if (!conf) return;
        conf.set(name as string, value);
      });
    };
  }
}

export = thinkConfig;
