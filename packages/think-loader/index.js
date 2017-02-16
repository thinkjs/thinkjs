const helper = require('think-helper');
const path = require('path');
const config = require('./loader/config.js');
const bootstrap = require('./loader/bootstrap.js');
const common = require('./loader/common.js');
/**
 * Loader
 */
class Loader {
  /**
   * constructor
   */
  constructor(appPath){
    this.appPath = appPath;
    this.isMultiModule = false;
    let dir = path.join(appPath, 'common/config');
    if(helper.isDirectory(dir)){
      this.isMultiModule = true;
    }
  }
  /**
   * load config
   */
  loadConfig(){
    return config(this.appPath, this.isMultiModule);
  }
  /**
   * load bootstrap
   */
  loadBootstrap(){
    return bootstrap(this.appPath, this.isMultiModule);
  }
  /**
   * load controller
   */
  loadController(){
    return common(this.appPath, this.isMultiModule, 'controller');
  }
  /**
   * load logic
   */
  loadLogic(){
    return common(this.appPath, this.isMultiModule, 'logic');
  }
  /**
   * load model
   */
  loadModel(){
    return common(this.appPath, this.isMultiModule, 'model');
  }
  /**
   * load service
   */
  loadService(){
    return common(this.appPath, this.isMultiModule, 'service');
  }
  /**
   * load use defined file
   */
  loadCommon(name){
    return common(this.appPath, this.isMultiModule, name);
  }
}

module.exports = Loader;