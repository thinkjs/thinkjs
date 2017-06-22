const fs = require('fs');
const path = require('path');
const colors = require('colors');
const helper = require('think-helper');
const commander = require('commander');

class Commander {
  constructor() {
    this.mode = 'normal';
    this.appPath = '';
    this.cwd = process.cwd();
    this.templatePath = path.join(__dirname, 'template');
    this.projectRootPath = this.cwd;
    this.rest = false;
  }

  parseArgv(argv) {
    this.bindDirective();
    commander.parse(argv);
  }

/**
 * log
 * @param  {Function} fn []
 * @return {}      []
 */
  log(fn) {
    console.log('  ' + fn(colors));
  }

  getPath(m, type) {
    if (this.mode === 'module') {
      return path.join(this.appPath, m, type);
    }
    return path.join(this.appPath, type);
  }

  mkdir(dir) {
    if (helper.isDirectory(dir)) {
      return;
    }
    helper.mkdir(dir);
    this.log(colors => {
      return colors.cyan('create') + ' : ' + path.relative(this.cwd, dir);
    });
  }

  /**
   * get version
   * @return {String} []
   */
  getVersion() {
    let filepath = path.resolve(__dirname, './package.json');
    let version = JSON.parse(fs.readFileSync(filepath)).version;
    return version;
  }

  /**
   * get app root path
   * @return {} []
   */
  getProjectAppPath() {
    return path.join(this.projectRootPath, 'src');
  }

  /**
   * get app name
   * @return {} []
   */
  getAppName() {
    let filepath = path.normalize(this.cwd + '/' + this.projectRootPath).replace(/\\/g, '');
    let matched = filepath.match(/([^\/]+)\/?$/);
    return matched[1];
  }

  /**
   * copy file
   * @param  {String} source []
   * @param  {String} target []
   * @return {}        []
   */
  copyFile(source, target, replace, showWarning) {
    if (showWarning === undefined) {
      showWarning = true;
    }

    if (helper.isBoolean(replace)) {
      showWarning = replace;
      replace = '';
    }

    //if target file is exist, ignore it
    if (helper.isFile(target)) {
      if (showWarning) {
        this.log(colors => {
          return colors.yellow('exist') + ' : ' + path.normalize(target);
        });
      }
      return;
    }

    this.mkdir(path.dirname(target));


    //if source file is not exist
    if (!helper.isFile(this.templatePath + path.sep + source)) {
      return;
    }

    let content = fs.readFileSync(this.templatePath + path.sep + source, 'utf8');
    //replace content 
    if (helper.isObject(replace)) {
      for (let key in replace) {
        /*eslint-disable no-constant-condition*/
        while (1) {
          let content1 = content.replace(key, replace[key]);
          if (content1 === content) {
            content = content1;
            break;
          }
          content = content1;
        }
      }
    }

    fs.writeFileSync(target, content);
    this.log(colors => {
      return colors.cyan('create') + ' : ' + path.relative(this.cwd, target);
    });
  }

  isThinkApp(projectRootPath) {
    if (helper.isDirectory(projectRootPath)) {
      const list = ['src', 'view', 'development.js', 'production.js'];
      return list.every(item => {
        const filepath = path.join(projectRootPath, item);
        return helper.isFile(filepath) || helper.isDirectory(filepath);
      })
    }
    return false;
  }

  /**
   * is module exist
   * @param  {String}  module []
   * @return {Boolean}        []
   */
  isModuleExist(m) {
    let modelPath = this.getPath(m, 'model');
    return helper.isDirectory(modelPath);
  }

  /**
   * parse app config
   * @param  {} projectRootPath []
   * @return {}             []
   */
  parseAppConfig() {
    let filepath = path.join(this.projectRootPath, 'src/common');
    if (helper.isDirectory(filepath)) {
      this.mode = 'module';
    }
    this.appPath = this.getProjectAppPath();
  }

  /**
   * get view root path;
   * @return {String}             []
   */
  getProjectViewPath(m) {
    if (this.mode === 'module') {
      return path.join(this.projectRootPath, 'view', m);
    }
    return path.join(this.projectRootPath, 'view');
  }

  /**
   * check env
   * @return {} []
   */
  _checkEnv() {
    if (!this.isThinkApp('./')) {
      console.log();
      this.log(colors => {
        return colors.red('current path is not thinkjs project.\n');
      });
      process.exit();
    }
    this.parseAppConfig();
    console.log();
  }

  /**
   * copy common files
   * @param  {String} projectRootPath []
   * @return {}             []
   */
  _copyWwwFiles() {
    this.mkdir(this.projectRootPath);

    this.copyFile('package.json', this.projectRootPath + '/package.json');

    let ROOT_PATH = this.projectRootPath + '/www';
    this.copyFile('nginx.conf', this.projectRootPath + '/nginx.conf', {
      '<ROOT_PATH>': ROOT_PATH
    });

    this.copyFile('pm2.json', this.projectRootPath + '/pm2.json', {
      '<ROOT_PATH>': path.dirname(ROOT_PATH),
      '<APP_NAME>': this.getAppName()
    });

    this.copyFile('eslintrc', this.projectRootPath + '/.eslintrc');
    this.copyFile('gitignore', this.projectRootPath + '/.gitignore');
    this.copyFile('README.md', this.projectRootPath + '/README.md');


    this.mkdir(this.projectRootPath + '/www');
    this.copyFile('development.js', this.projectRootPath + '/development.js');
    this.copyFile('production.js', this.projectRootPath + '/production.js');

    this.mkdir(this.projectRootPath + '/www/static/');
    this.mkdir(this.projectRootPath + '/www/static/js');
    this.mkdir(this.projectRootPath + '/www/static/css');
    this.mkdir(this.projectRootPath + '/www/static/img');
  }

  /**
   * copy common config files
   * @return {}             []
   */
  _copyCommonConfigFiles() {
    let rootPath = this.getPath('common', 'config');
    this.mkdir(rootPath);

    this.copyFile('src/config/config.js', rootPath + '/config.js', false);
    this.copyFile('src/config/adapter.js', rootPath + '/adapter.js');
    this.copyFile('src/config/config.production.js', rootPath + '/config.production.js');
    this.copyFile('src/config/extend.js', rootPath + '/extend.js');
    this.copyFile('src/config/middleware.js', rootPath + '/middleware.js');
    this.copyFile('src/config/router.js', rootPath + '/router.js');
    this.copyFile('src/config/adapter/cache.js', rootPath + '/adapter/cache.js');
    this.copyFile('src/config/adapter/model.js', rootPath + '/adapter/model.js');
    this.copyFile('src/config/adapter/session.js', rootPath + '/adapter/session.js');
    this.copyFile('src/config/adapter/view.js', rootPath + '/adapter/view.js');
  }

  /**
   * copy bootstrap files
   * @return {}             []
   */
  _copyCommonBootstrapFiles() {
    let rootPath = this.getPath('common', 'bootstrap');
    this.mkdir(rootPath);

    this.copyFile('src/bootstrap/master.js', rootPath + '/master.js');
    this.copyFile('src/bootstrap/worker.js', rootPath + '/worker.js');
  }

  /**
   * create module
   * @param  {String} module      []
   * @return {}             []
   */
  _createModule(m) {
    if (this.mode !== 'module' && m !== 'home') {
      this.log(colors => {
        return colors.red('app mode is not module, can not create module.\n');
      });
      process.exit();
    }
    if (this.isModuleExist(m)) {
      this.log(colors => {
        return colors.red('module `' + m + '` is exist.\n');
      });
      process.exit();
    }

    //config files
    let configPath = this.getPath(m, 'config');
    this.mkdir(configPath);
    this.copyFile('src/config/config.js', configPath + '/config.js', false);

    //controller files
    let controllerPath = this.getPath(m, 'controller');
    this.mkdir(controllerPath);
    this.copyFile('src/controller/base.js', controllerPath + '/base.js');
    this.copyFile('src/controller/index.js', controllerPath + '/index.js');

    //logic files
    let logicPath = this.getPath(m, 'logic');
    this.mkdir(logicPath);
    this.copyFile('src/logic/index.js', logicPath + '/index.js');

    //model files
    let modelPath = this.getPath(m, 'model');
    this.mkdir(modelPath);
    this.copyFile('src/model/index.js', modelPath + '/index.js', false);

    //view files
    let viewPath = this.getProjectViewPath(m);
    this.mkdir(viewPath);
    this.copyFile('view/index_index.html', viewPath + '/index_index.html');
  }

  /**
   * create module
   * @param  {} module []
   * @return {}        []
   */
  createModule(m) {
    this._checkEnv();

    if (m === 'common') {
      return;
    }

    this._createModule(m);
  }

  /**
   * create controller
   * @param  {} controller []
   * @return {}            []
   */
  createController(controller) {
    this._checkEnv();

    controller = controller.split('/');
    let m = 'common';
    if (controller.length >= 2) {
      m = controller[0];
      controller = controller.slice(1).join('/');
    } else {
      controller = controller[0];
    }

    if (!this.isModuleExist(m)) {
      this.createModule(m);
    }

    let controllerPath = this.getPath(m, 'controller');
    if (this.rest) {
      this.copyFile('src/controller/rest.js', controllerPath + '/rest.js', false);
      this.copyFile('src/controller/restIndex.js', controllerPath + '/' + controller + '.js');
    } else {
      this.copyFile('src/controller/index.js', controllerPath + '/' + controller + '.js');
    }

    let logicPath = this.getPath(m, 'logic');
    this.copyFile('src/logic/index.js', logicPath + '/' + controller + '.js');

    console.log();
  }

  /**
   * create service
   * @param  {} controller []
   * @return {}            []
   */
  createService(service) {
    this._checkEnv();

    service = service.split('/');
    let module = 'common';
    if (service.length === 2) {
      module = service[0];
      service = service[1];
    } else {
      service = service[0];
    }

    if (!this.isModuleExist(module)) {
      this.createModule(module);
    }

    let servicePath = this.getPath(module, 'service');
    this.copyFile('src/service/index.js', servicePath + '/' + service + '.js');

    console.log();
  }

  /**
   * create model file
   * @param  {String} model []
   * @return {}       []
   */
  createModel(model) {
    this._checkEnv();

    model = model.split('/');
    let m = 'common';
    if (model.length === 2) {
      m = model[0];
      model = model[1];
    } else {
      model = model[0];
    }

    if (!this.isModuleExist(m)) {
      this.createModule(m);
    }

    let modelPath = this.getPath(m, 'model');
    this.copyFile('src/model/index.js', modelPath + '/' + model + '.js');

    console.log();
  }

  /**
   * create middleware
   * @param  {String} middleware []
   * @return {[type]}            []
   */
  createMiddleware(middleware) {
    this._checkEnv();
    let midlewarePath = this.getPath('common', 'middleware');
    let filepath = midlewarePath + '/' + middleware + '.js';
    this.mkdir(midlewarePath);
    this.copyFile('src/middleware/base.js', filepath);

    console.log();
  }

  /**
   * create adapter
   * @param  {String} adatper []
   * @return {}         []
   */
  createAdapter(adapter) {
    this._checkEnv();

    adapter = adapter.split('/');

    let type = adapter[0];
    let name = adapter[1] || 'base';

    let adapterPath = this.getPath('common', 'adapter');

    this.copyFile('src/adapter/base.js', adapterPath + '/' + type + '/' + name + '.js');

    console.log();
  }

  /**
   * module app
   * @param  {} projectRootPath []
   * @return {}             []
   */
  _createProject() {

    this._copyWwwFiles();

    this.mkdir(this.appPath);

    this._copyCommonBootstrapFiles();
    this._copyCommonConfigFiles();

    this._createModule('home');
  }

  /**
   * create project
   * @param  {String} projectRootPath []
   * @return {}             []
   */
  createProject() {
    if (this.isThinkApp(this.projectRootPath)) {
      console.log();
      this.log(colors => {
        return colors.red('path `' + this.projectRootPath + '` is already a thinkjs project.\n');
      });
      return;
    }
    console.log();

    this.appPath = this.getProjectAppPath();
    this._createProject();


    let p = this.projectRootPath.slice(this.cwd.length);
    if (p[0] === path.sep) {
      p = p.slice(1);
    }

    console.log();
    console.log('  enter path:');
    console.log('  $ cd ' + p);
    console.log();

    console.log('  install dependencies:');
    console.log('  $ npm install');
    console.log();

    console.log('  run the app:');
    console.log('  $ npm start');

    console.log();
  }

  /**
   * display thinkjs version
   * @return {} []
   */
  displayVersion() {
    let version = this.getVersion();
    let chars = [
      ' _______ _     _       _        _  _____ ',
      '|__   __| |   (_)     | |      | |/ ____|',
      '   | |  | |__  _ _ __ | | __   | | (___  ',
      '   | |  | \'_ \\| | \'_ \\| |/ /   | |\\___ \\ ',
      '   | |  | | | | | | | |   < |__| |____) |',
      '   |_|  |_| |_|_|_| |_|_|\\_\\____/|_____/ ',
      '                                         '
    ].join('\n');
    console.log('\n v' + version + '\n');
    console.log(chars);
  }

  bindDirective() {
    commander.usage('[command] <options ...>');
    commander.option('-v, --version', 'output the version number', () => {
      this.displayVersion();
    });
    commander.option('-V', 'output the version number', () => {
      this.displayVersion();
    });
    commander.option('-m, --mode <mode>', 'project mode type(normal, module), default is normal, using in `new` command', m => {
      this.mode = m;
    });

    //create project
    commander.command('new <projectPath>').description('create project').action(projectPath => {
      this.projectRootPath = path.resolve(this.projectRootPath, projectPath);
      this.createProject();
    });

    //create module
    commander.command('module <moduleName>').description('add module').action(m => {
      this.createModule(m.toLowerCase());
    });

    //create controlelr
    commander.command('controller <controllerName>').description('add controller').action(controller => {
      this.createController(controller.toLowerCase());
    });

    //create service
    commander.command('service <serviceName>').description('add service').action(service => {
      this.createService(service.toLowerCase());
    });

    //create model
    commander.command('model <modelName>').description('add model').action(model => {
      this.createModel(model.toLowerCase());
    });

    //create middleware
    commander.command('middleware <middlewareName>').description('add middleware').action(middleware => {
      this.createMiddleware(middleware.toLowerCase());
    });

    //create rest controller
    commander.option('-r', 'create rest controller', () => {
      this.rest = true;
    });

    //create adapter
    commander.command('adapter <adapterName>').description('add adapter').action(adapter => {
      this.createAdapter(adapter.toLowerCase());
    });
  }

}

module.exports = Commander;