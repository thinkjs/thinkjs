const helper = require('think-helper');
const path = require('path');
const fs = require('fs');
const config = require('./loader/config.js');
const bootstrap = require('./loader/bootstrap.js');
const middleware = require('./loader/middleware.js');
const router = require('./loader/router.js');
const extend = require('./loader/extend.js');
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
    this.modules = [];
    let dir = path.join(appPath, 'common/config');
    if(helper.isDirectory(dir)){
      this.modules = fs.readdirSync(appPath).filter(item => {
        let stat = fs.statSync(path.join(appPath, item));
        return stat.isDirectory();
      });
    }
  }
  /**
   * load config
   */
  loadConfig(env){
    return config(this.appPath, this.thinkPath, env, this.modules);
  }
  /**
   * load bootstrap
   */
  loadBootstrap(){
    return bootstrap(this.appPath, this.modules);
  }
  /**
   * load controller
   */
  loadController(){
    return common(this.appPath, 'controller', this.modules);
  }
  /**
   * load logic
   */
  loadLogic(){
    return common(this.appPath, 'logic', this.modules);
  }
  /**
   * load model
   */
  loadModel(){
    return common(this.appPath, 'model', this.modules);
  }
  /**
   * load service
   */
  loadService(){
    return common(this.appPath, 'service', this.modules);
  }
  /**
   * load middleware
   */
  loadMiddleware(){
    return middleware(this.appPath, this.thinkPath, this.modules);
  }
  /**
   * load router
   */
  loadRouter(){
    return router(this.appPath, this.modules);
  }
  /**
   * load extend
   */
  loadExtend(){
    return extend(this.appPath, this.thinkPath, this.modules);
  }
  /**
   * load use defined file
   */
  loadCommon(name){
    return common(this.appPath, name, this.modules);
  }
}

module.exports = Loader;