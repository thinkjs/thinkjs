const helper = require('think-helper');
/**
 * config manage
 */
class Config {
  /**
   * constructor
   * @param {config} config data
   */
  constructor(config = {}) {
    this.config = config;
  }
  /**
   * get config
   * get(), get('name'), get('foo.bar.xxx')
   * @param {name} undefined|String
   */
  get(name, config) {
    if (!name) {
      return this.config;
    }
    config = config || this.config;
    if (name.indexOf('.') === -1) {
      return config[name];
    }
    name = name.split('.');
    const length = name.length;
    name.some((item, index) => {
      config = config[item];
      if (index !== length - 1 && !helper.isObject(config)) {
        config = undefined;
        return true;
      }
    });
    return config;
  }
  /**
   * set config
   * set('name', 'value'), set('foo.bar', 'value')
   */
  set(name, value) {
    if (name.indexOf('.') === -1) {
      this.config[name] = value;
    }
    let config = this.config;
    name = name.split('.');
    const length = name.length;
    name.forEach((item, index) => {
      if (index === length - 1) {
        config[item] = value;
      } else {
        if (!helper.isObject(config[item])) {
          config[item] = {};
        }
        config = config[item];
      }
    });
    return this;
  }
}

function getConfigFn(configs, isMultiModule) {
  const configInstances = {};
  if (isMultiModule) {
    for (const name in configs) {
      configInstances[name] = new Config(configs[name]);
    }
  } else {
    configInstances.common = new Config(configs);
  }
  return (name, value, m = 'common') => {
    let conf = configInstances.common;
    if (isMultiModule && m) {
      conf = configInstances[m];
    }
    if (!conf) return;
    if (value === undefined) {
      return conf.get(name);
    }
    conf.set(name, value);
  };
}

exports.Config = Config;
exports.getConfigFn = getConfigFn;
