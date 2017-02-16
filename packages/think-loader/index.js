const helper = require('think-helper');
const path = require('path');
const config = require('./loader/config.js');
const bootstrap = require('./loader/bootstrap.js');

/**
 * Loader
 */
class Loader {
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
}

module.exports = Loader;