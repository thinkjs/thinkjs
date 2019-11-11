const helper = require('think-helper');
const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const assert = require('assert');
const debug = require('debug')(`think-loader-config-${process.pid}`);

const SYS_CONFIG = require('thinkjs/lib/config/config');

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
  load(appPath, env, modules) {
    if (modules.length) {
      const result = {};
      modules.forEach(modName => {
        // merge common & module config
        const paths = [
          path.join(appPath, 'common/config')
        ];
        if (modName !== 'common') {
          paths.push(path.join(appPath, modName, 'config'));
        }

        const config = helper.extend(
          {}, SYS_CONFIG, this.loadConfig(paths, env, 'config')
        );
        const adapter = this.formatAdapter(
          this.loadConfig(paths, env, 'adapter'),
          this.loadAdapter(path.join(appPath, 'common/adapter'))
        );
        // const adapter = {};
        result[modName] = helper.extend({}, config, adapter);
      });
      return result;
    }

    const paths = [path.join(appPath, 'config')];
    const config = helper.extend(
      {}, SYS_CONFIG, this.loadConfig(paths, env, 'config')
    );

    const adapter = this.formatAdapter(
      this.loadConfig(paths, env, 'adapter'),
      this.loadAdapter(path.join(appPath, 'adapter'))
    );
    return helper.extend({}, config, adapter);
  }
}

module.exports = Config;
