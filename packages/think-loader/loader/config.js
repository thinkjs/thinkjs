const helper = require('think-helper');
const path = require('path');
const interopRequire = require('./util.js').interopRequire;
const assert = require('assert');
const debug = require('debug')(`think-loader-config-${process.pid}`);

const SYS_CONFIG = require('thinkjs/lib/config/config');

class Config {
  loadConfigByName(config, configPaths, name) {
    configPaths.forEach(configPath => {
      const filepath = path.join(configPath, name);
      if (helper.isFile(filepath)) {
        debug(`load file: ${filepath}`);
        config = helper.extend(config, require(filepath));
      }
    });
  }

  loadConfig(configPaths, env, name = 'config') {
    const config = {};
    this.loadConfigByName(config, configPaths, `${name}.js`);
    this.loadConfigByName(config, configPaths, `${name}.${env}.js`);
    return config;
  }

  loadAdapter(adapterPath) {
    const files = helper.getdirFiles(adapterPath);
    const ret = {};
    files.forEach(file => {
      if (!/^(?!\.).+\.js$/i.test(file)) return;
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

  formatAdapter(config, appAdapters) {
    for (const name in config) {
      assert(helper.isObject(config[name]), `adapter.${name} must be an object`);
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
        item = helper.extend({}, common, item);
        if (item.handle && helper.isString(item.handle)) {
          assert(name in appAdapters && appAdapters[name][item.handle], `can not find ${name}.${type}.handle`);
          item.handle = appAdapters[name][item.handle];
        }
        config[name][type] = item;
      }
    }
    return config;
  }

  load(appPath, env, modules) {
    if (modules.length) {
      const result = {};
      modules.forEach(modName => {
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
