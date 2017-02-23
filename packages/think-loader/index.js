const helper = require('think-helper');
const path = require('path');
const config = require('./loader/config.js');
const bootstrap = require('./loader/bootstrap.js');
const view = require('./loader/view.js');
const middleware = require('./loader/middleware.js');
const router = require('./loader/router.js');
const common = require('./loader/common.js');


/**
 * Loader
 */
class Loader {
  /**
   * constructor
   */
  constructor(appPath, thinkPath){
    this.appPath = appPath;
    this.thinkPath = thinkPath;
    this.isMultiModule = false;
    let dir = path.join(appPath, 'common/config');
    if(helper.isDirectory(dir)){
      this.isMultiModule = true;
    }
  }
  /**
   * load config
   */
  loadConfig(env){
    return config.load(this.appPath, this.isMultiModule, this.thinkPath, env);
  }
  /**
   * load bootstrap
   */
  loadBootstrap(){
    return bootstrap.load(this.appPath, this.isMultiModule);
  }
  /**
   * load controller
   */
  loadController(){
    return common.load(this.appPath, this.isMultiModule, 'controller');
  }
  /**
   * load logic
   */
  loadLogic(){
    return common.load(this.appPath, this.isMultiModule, 'logic');
  }
  /**
   * load model
   */
  loadModel(){
    return common.load(this.appPath, this.isMultiModule, 'model');
  }
  /**
   * load service
   */
  loadService(){
    return common.load(this.appPath, this.isMultiModule, 'service');
  }
  /**
   * load view
   */
  loadView(viewPath){
    return view.load(viewPath);
  }
  /**
   * load middleware
   */
  loadMiddleware(){
    return middleware.load(this.appPath, this.isMultiModule, this.thinkPath);
  }
  /**
   * load router
   */
  loadRouter(){
    return router.load(this.appPath, this.isMultiModule);
  }
  /**
   * load use defined file
   */
  loadCommon(name){
    return common.load(this.appPath, this.isMultiModule, name);
  }
}

module.exports = Loader;