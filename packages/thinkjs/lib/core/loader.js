const extend = require('think-loader/extend');

module.exports = class CoreLoader {
  /**
   * load app data
   */
  loadData() {
    // add data to the application
    think.app.modules = think.loader.modules;
    think.app.models = think.loader.loadModel();
    think.app.services = think.loader.loadService();
    think.app.logics = think.loader.loadLogic();
    think.app.controllers = think.loader.loadController();
    think.app.routers = think.loader.loadRouter();
    think.app.validators = think.loader.loadValidator();
  }
  /**
   * load middleware
   */
  loadMiddleware() {
    const middlewares = think.loader.loadMiddleware(think.app);
    middlewares.forEach((middleware) => {
      think.app.use(middleware);
    });
  }
  /**
   * load extend
   */
  loadExtend() {
    const exts = think.loader.loadExtend();
    const list = [
      ['think', think],
      ['application', think.app],
      ['context', think.app.context],
      ['request', think.app.request],
      ['response', think.app.response],
      ['controller', think.Controller.prototype],
      ['logic', think.Logic.prototype],
      ['service', think.Service.prototype]
    ];
    list.forEach((item) => {
      if (!exts[item[0]]) return;
      extend(item[1], exts[item[0]]);
    });
  }
};
