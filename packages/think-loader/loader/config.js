const helper = require('think-helper');
const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const assert = require('assert');
const debug = require('debug')(`think-loader-config-${process.pid}`);

/**
 * load config
 */
class Config {
  /**
   * load config and merge
   * @param {Object} config
   * @param {Array} configPaths
   * @param {String} name
   */
  loadConfigByName(config, configPaths, name) {
    configPaths.forEach(configPath => {
      const filepath = path.join(configPath, name);
      if (helper.isFile(filepath)) {
        debug(`load file: ${filepath}`);
        config = helper.extend(config, require(filepath));
      }
    });
  }

  /**
   * load config
   * src/config/config.js
   * src/config/config.[env].js
   */
  loadConfig(configPaths, env, name = 'config') {
    const config = {};
    this.loadConfigByName(config, configPaths, `${name}.js`);
    this.loadConfigByName(config, configPaths, `${name}.${env}.js`);
    return config;
  }

  /**
   * load apdater in application
   * src/adapter/session/file.js
   * src/adapter/session/db.js
   */
  loadAdapter(adapterPath) {
    const files = helper.getdirFiles(adapterPath);
    const ret = {};
    files.forEach(file => {
      if (!/\.js$/.test(file)) return; // only load js files
      const item = file.replace(/\.\w+$/, '').split(path.sep);
      if (item.length !== 2 || !item[0] || !item[1]) {
        return;
      }
      if (!ret[item[0]]) {
        ret[item[0]] = {};
      }
      const filepath = path.join(adapterPath, file);
      debug(`load adapter file: ${filepath}`);
      ret[item[0]][item[1]] = interopRequire(filepath);
    });
    return ret;
  }

  /**
   * {
   *   db: {
   *      type: 'xxx',
   *      common: {
   *
   *      },
   *      xxx: {
   *
   *      }
   *   }
   * }
   * format adapter config, merge common field to item
   */
  formatAdapter(config, appAdapters) {
    for (const name in config) {
      assert(helper.isObject(config[name]), `adapter.${name} must be an object`);
      // ignore adapter when is emtpy, only has key
      if (helper.isEmpty(config[name])) {
        continue;
      }
      assert(config[name].type, `adapter.${name} must have type field`);
      if (!config[name].common) {
        continue;
      }
      const common = config[name].common;
      assert(helper.isObject(common), `adapter.${name}.common must be an object`);
      delete config[name].common;
      for (const type in config[name]) {
        if (type === 'type') {
          continue;
        }
        let item = config[name][type];
        if (!helper.isObject(item)) {
          continue;
        }
        // merge common field to item
        item = helper.extend({}, common, item);
        // convert string handle to class
        if (item.handle && helper.isString(item.handle)) {
          assert(name in appAdapters && appAdapters[name][item.handle], `can not find ${name}.${type}.handle`);
          item.handle = appAdapters[name][item.handle];
        }
        config[name][type] = item;
      }
    }
    return config;
  }

  /**
   * load config files
   *
   * thinkPath/lib/config/config.js
   * thinkPath/lib/config/adapter.js
   *
   * src/config/config.js
   * src/config/config.[env].js
   * src/config/adapter.js
   * src/config/adapter.[env].js
   */
  load(appPath, thinkPath, env, modules) {
    const thinkConfig = interopRequire(path.join(thinkPath, 'lib/config/config.js'));
    if (modules.length) {
      const result = {};
      modules.forEach(dir => {
        // merge common & module config
        const paths = [
          path.join(thinkPath, 'lib/config'),
          path.join(appPath, 'common/config')
        ];

        if (dir !== 'common') {
          paths.push(path.join(appPath, dir, 'config'));
        }
        const config = this.loadConfig(paths, env);
        const adapterConfig = this.loadConfig(paths, env, 'adapter');
        const adapter = this.loadAdapter(path.join(appPath, 'common/adapter'));
        result[dir] = helper.extend({}, thinkConfig, config, this.formatAdapter(adapterConfig, adapter));
      });
      return result;
    } else {
      const configPath = [path.join(appPath, 'config')];
      const config = this.loadConfig(configPath, env);
      const thinkAdapterConfig = this.loadConfig([path.join(thinkPath, 'lib/config')], env, 'adapter');
      const adapterConfig = this.loadConfig(configPath, env, 'adapter');
      const adapter = this.loadAdapter(path.join(appPath, 'adapter'));
      return helper.extend({}, thinkConfig, config, thinkAdapterConfig, this.formatAdapter(adapterConfig, adapter));
    }
  }
}

module.exports = Config;
