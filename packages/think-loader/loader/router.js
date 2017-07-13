const helper = require('think-helper');
const debug = require('debug')('think-loader@router');
const path = require('path');
const assert = require('assert');
const interopRequire = require('./util.js').interopRequire;

const RouterLoader = {

  /**
   * route loader
   */
  load(appPath, modules) {
    if (modules.length) {
      const commonRouterFile = path.join(appPath, 'common/config/router.js');
      if (!helper.isFile(commonRouterFile)) {
        return [];
      }
      const commonRouter = interopRequire(commonRouterFile);
      if (helper.isArray(commonRouter)) {
        debug('common/config/router is an array');
        return commonRouter;
      }
      /**
       * rules in multi module
       * rule = {
       *    home: {
       *      match: '',
       *      rules: []
       *    },
       *    admin: {
       *      match: '',
       *      rules: []
       *    }
       * }
       */
      debug('load module router');
      for (const name in commonRouter) {
        const match = commonRouter[name].match;
        const moduleRouterFile = path.join(appPath, name, 'config/router.js');
        // match is not required
        if (match) {
          commonRouter[name].match = match;
        }
        if (!helper.isFile(moduleRouterFile)) {
          commonRouter[name].rules = [];
          continue;
        }
        const moduleRouter = interopRequire(moduleRouterFile);
        assert(helper.isArray(moduleRouter), `${name}/config/router.js must be an array`);
        commonRouter[name].rules = moduleRouter;
      }
      return commonRouter;
    } else {
      const routerFile = path.join(appPath, 'config/router.js');
      if (!helper.isFile(routerFile)) {
        return [];
      }
      const router = interopRequire(routerFile);
      assert(helper.isArray(router), 'config/router must be an array');
      return router;
    }
  }
};

module.exports = RouterLoader;
