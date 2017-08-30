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
    this.projectRootPath = this.cwd;
    this.rest = false;
    this.withoutCompile = false;
    this.bindDirective();
  }

  templatePath() {
    return path.join(__dirname, this.typescript ? 'template-ts' : 'template');
  }

  isTypescript() {
    return this.typescript || helper.isFile('tsconfig.json');
  }

  getExt() {
    return this.isTypescript() ? 'ts' : 'js';
  }

  parseArgv(argv) {
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
    const filepath = path.resolve(__dirname, './package.json');
    const version = JSON.parse(fs.readFileSync(filepath)).version;
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
    const filepath = path.normalize(this.cwd + '/' + this.projectRootPath).replace(/\\/g, '');
    const matched = filepath.match(/([^/]+)\/?$/);
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

    // if target file is exist, ignore it
    if (helper.isFile(target)) {
      if (showWarning) {
        this.log(colors => {
          return colors.yellow('exist') + ' : ' + path.normalize(target);
        });
      }
      return;
    }

    this.mkdir(path.dirname(target));

    // if source file is not exist
    if (!helper.isFile(this.templatePath() + path.sep + source)) {
      return;
    }

    let content = fs.readFileSync(this.templatePath() + path.sep + source, 'utf8');
    // replace content 
    if (helper.isObject(replace)) {
      for (const key in replace) {
        /* eslint-disable no-constant-condition */
        while (1) {
          const content1 = content.replace(key, replace[key]);
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
      });
    }
    return false;
  }

  /**
   * is module exist
   * @param  {String}  module []
   * @return {Boolean}        []
   */
  isModuleExist(m) {
    const modelPath = this.getPath(m, 'model');
    return helper.isDirectory(modelPath);
  }

  /**
   * parse app config
   * @param  {} projectRootPath []
   * @return {}             []
   */
  parseAppConfig() {
    const filepath = path.join(this.projectRootPath, 'src/common');
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
    // console.log(path.resolve('./'), 'thinkjs');
    if (!this.isThinkApp(path.resolve('./'))) {
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

    if(this.isTypescript()) {
      this.copyFile('tsconfig.json', this.projectRootPath + '/tsconfig.json');
    }

    if (this.withoutCompile) {
      this.copyFile('package.wc.json', this.projectRootPath + '/package.json');
    } else {
      this.copyFile('package.json', this.projectRootPath + '/package.json');
    }

    const ROOT_PATH = this.projectRootPath + '/www';
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
    if (this.withoutCompile) {
      this.copyFile('development.wc.js', this.projectRootPath + '/development.js');
    } else {
      this.copyFile('development.js', this.projectRootPath + '/development.js');
    }

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
    const ext = this.getExt();
    const rootPath = this.getPath('common', 'config');
    this.mkdir(rootPath);

    this.copyFile(`src/config/config.${ext}`, rootPath + `/config.${ext}`, false);
    this.copyFile(`src/config/adapter.${ext}`, rootPath + `/adapter.${ext}`);
    this.copyFile(`src/config/config.production.${ext}`, rootPath + `/config.production.${ext}`);
    this.copyFile(`src/config/extend.${ext}`, rootPath + `/extend.${ext}`);
    this.copyFile(`src/config/middleware.${ext}`, rootPath + `/middleware.${ext}`);
    this.copyFile(`src/config/router.${ext}`, rootPath + `/router.${ext}`);
  }

  /**
   * copy bootstrap files
   * @return {}             []
   */
  _copyCommonBootstrapFiles() {

    const ext = this.getExt();
    const rootPath = this.getPath('common', 'bootstrap');
    this.mkdir(rootPath);

    this.copyFile(`src/bootstrap/master.${ext}`, rootPath + `/master.${ext}`);
    this.copyFile(`src/bootstrap/worker.${ext}`, rootPath + `/worker.${ext}`);
  }

  /**
   * create module
   * @param  {String} module      []
   * @return {}             []
   */
  _createModule(m) {
    const ext = this.getExt();
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

    // config files
    const configPath = this.getPath(m, 'config');
    this.mkdir(configPath);
    this.copyFile(`src/config/config.${ext}`, configPath + `/config.${ext}`, false);

    // controller files
    const controllerPath = this.getPath(m, 'controller');
    this.mkdir(controllerPath);
    this.copyFile(`src/controller/base.${ext}`, controllerPath + `/base.${ext}`);
    this.copyFile(`src/controller/index.${ext}`, controllerPath + `/index.${ext}`);

    // logic files
    const logicPath = this.getPath(m, 'logic');
    this.mkdir(logicPath);
    this.copyFile(`src/logic/index.${ext}`, logicPath + `/index.${ext}`);

    // model files
    const modelPath = this.getPath(m, 'model');
    this.mkdir(modelPath);
    this.copyFile(`src/model/index.${ext}`, modelPath + `/index.${ext}`, false);

    // view files
    const viewPath = this.getProjectViewPath(m);
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
  parseCSMName(name) {
    if (/\.js$/.test(name)) {
      name = name.slice(0, -3);
    }
    if (this.mode === 'normal') return { m: '', name };
    name = name.split('/');
    let m = 'common';
    if (name.length >= 2) {
      m = name[0];
      name = name.slice(1).join('/');
    } else {
      name = name[0];
    }
    if (!this.isModuleExist(m)) {
      this.createModule(m);
    }
    return { m, name };
  }
  /**
   * getPrefix form name
   * @param  {string} name - 文件名
   * @return {string} prefix - 路径前缀 
   */
  getPrefix(name) {
    let prefix = './';
    if (name.includes('/')) {
      let count = 0;
      name.split('').forEach(char => {
        if (char === '/') {
          count++;
        }
      });
      prefix = '../'.repeat(count);
    }
    return prefix;
  }
  /**
   * getTplFilePath
   * @param  {string} filePath - 相对于模板根目录的路径
   * @return {string} path     - 模板文件的绝对路径
   */
  getTplFilePath(filePath) {
    return path.resolve(this.templatePath(), filePath);
  }
  /**
   * 
   * @param {string} source  - 源文件绝对路径
   * @param {string} target  - 目标文件绝对路径
   * @param {string} replace - 要替换的模板字符串
   * @param {string} content - 替换的内容
   */
  replaceFileContent(source, target, replace, content) {
    let tpl = fs.readFileSync(source, 'utf-8');
    tpl = tpl.replace(replace, `${content}`);
    fs.writeFileSync(target, tpl);
  }
  /**
   * create controller
   * @param  {} controller []
   * @return {}            []
   */
  createController(controller) {
    this._checkEnv();
    const ext = this.getExt();
    const { m, name } = this.parseCSMName(controller);

    const controllerPath = this.getPath(m, 'controller');

    const prefix = this.getPrefix(name);

    const baseTplPath = this.getTplFilePath(`src/controller/index_tpl.${ext}`);
    const restTplPath = this.getTplFilePath(`src/controller/restIndex_tpl.${ext}`);

    const baseGenPath = this.getTplFilePath(`src/controller/index_gen.${ext}`);
    const restGenPath = this.getTplFilePath(`src/controller/restIndex_gen.${ext}`);

    if (this.rest) {
      this.replaceFileContent(restTplPath, restGenPath, '{path}', prefix);
      this.copyFile(`src/controller/rest.${ext}`, controllerPath + `/rest.${ext}`, false);
      this.copyFile(`src/controller/restIndex_gen.${ext}`,`${controllerPath}/${name}.${ext}`);
    } else {
      this.replaceFileContent(baseTplPath, baseGenPath, '{path}', prefix);
      this.copyFile(`src/controller/index_gen.${ext}`, `${controllerPath}/${name}.${ext}`);
    }

    const logicPath = this.getPath(m, 'logic');
    this.copyFile(`src/logic/index.${ext}`, `${logicPath}/${name}.${ext}`);

    console.log();
  }

  /**
   * create service
   * @param  {} controller []
   * @return {}            []
   */
  createService(service) {
    this._checkEnv();

    const ext = this.getExt();
    const { m, name } = this.parseCSMName(service);

    const servicePath = this.getPath(m, 'service');
    this.copyFile(`src/service/index.${ext}`, `${servicePath}/${name}.${ext}`);

    console.log();
  }

  /**
   * create model file
   * @param  {String} model []
   * @return {}       []
   */
  createModel(model) {
    this._checkEnv();

    const ext = this.getExt();
    const { m, name } = this.parseCSMName(model);

    const modelPath = this.getPath(m, 'model');
    this.copyFile(`src/model/index.${ext}`, `${modelPath}/${name}.${ext}`);

    console.log();
  }

  /**
   * create middleware
   * @param  {String} middleware []
   * @return {[type]}            []
   */
  createMiddleware(middleware) {
    this._checkEnv();
    const ext = this.getExt();
    const midlewarePath = this.getPath('common', 'middleware');
    this.mkdir(midlewarePath);
    this.copyFile(`src/middleware/base.${ext}`, `${midlewarePath}/${middleware}.${ext}`);

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

    const ext = this.getExt();
    const type = adapter[0];
    const name = adapter[1] || 'base';

    const adapterPath = this.getPath('common', 'adapter');

    this.copyFile(`src/adapter/base.${ext}`, `${adapterPath}/${type}/${name}.${ext}`);

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
    const version = this.getVersion();
    // const chars = [
    //   ' _______ _     _       _        _  _____ ',
    //   '|__   __| |   (_)     | |      | |/ ____|',
    //   '   | |  | |__  _ _ __ | | __   | | (___  ',
    //   '   | |  | \'_ \\| | \'_ \\| |/ /   | |\\___ \\ ',
    //   '   | |  | | | | | | | |   < |__| |____) |',
    //   '   |_|  |_| |_|_|_| |_|_|\\_\\____/|_____/ ',
    //   '                                         '
    // ].join('\n');
    console.log('think-cli@' + version);
    console.log(colors.yellow('Tips:This version means the version of `thinkjs` commander you use in terminal. It doesn\'t equal ThinkJS version you use in project. The version of ThinkJS your project dependent can get quickly by using `npm ls thinkjs` in your project.'));
    // console.log(chars);
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

    commander.option('-t, --typescript', 'use typescript, use in new', () => {
      this.typescript = true;
    });

    // create project
    commander.command('new <projectPath>').description('create project').action(projectPath => {
      this.projectRootPath = path.resolve(this.projectRootPath, projectPath);
      this.createProject();
    });

    // create module
    commander.command('module <moduleName>').description('add module').action(m => {
      this.createModule(m.toLowerCase());
    });

    // create controlelr
    commander.command('controller <controllerName>').description('add controller').action(controller => {
      this.createController(controller.toLowerCase());
    });

    // create service
    commander.command('service <serviceName>').description('add service').action(service => {
      this.createService(service.toLowerCase());
    });

    // create model
    commander.command('model <modelName>').description('add model').action(model => {
      this.createModel(model.toLowerCase());
    });

    // create middleware
    commander.command('middleware <middlewareName>').description('add middleware').action(middleware => {
      this.createMiddleware(middleware.toLowerCase());
    });

    // create rest controller
    commander.option('-r, --rest', 'create rest controller', () => {
      this.rest = true;
    });

    commander.option('-w, --no-compile', 'without babel compile', () => {
      this.withoutCompile = true;
    });

    // create adapter
    commander.command('adapter <adapterName>').description('add adapter').action(adapter => {
      this.createAdapter(adapter.toLowerCase());
    });
  }
}

module.exports = Commander;
