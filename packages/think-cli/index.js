#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const commander = require('commander');
const colors = require('colors');
const helper = require('think-helper');

let cwd = process.cwd();
let templatePath = path.join(__dirname, 'template');
let projectRootPath = cwd; //project root path

let mode = 'normal';
let appPath = '';

/**
 * log
 * @param  {Function} fn []
 * @return {}      []
 */
let log = fn => {
  console.log('  ' + fn(colors));
};

let getPath = (m, type) => {
  if(mode === 'module'){
    return path.join(appPath, m, type);
  }
  return path.join(appPath, type);
}
/**
 * mkdir
 * @param  {String} dir []
 * @return {}     []
 */
let mkdir = dir => {
  if(helper.isDirectory(dir)){
    return;
  }
  helper.mkdir(dir);
  log(colors => {
    return colors.cyan('create') + ' : ' + path.relative(cwd, dir);
  });
};

/**
 * get version
 * @return {String} []
 */
let getVersion = () => {
  let filepath = path.resolve(__dirname, './package.json');
  let version = JSON.parse(fs.readFileSync(filepath)).version;
  return version;
};

/**
 * get app root path
 * @return {} []
 */
let getProjectAppPath = () => {
  return path.join(projectRootPath, 'src');
};
/**
 * get app name
 * @return {} []
 */
let getAppName = () => {
  let filepath = path.normalize(cwd + '/' + projectRootPath).replace(/\\/g, '');
  let matched = filepath.match(/([^\/]+)\/?$/);
  return matched[1];
};

/**
 * copy file
 * @param  {String} source []
 * @param  {String} target []
 * @return {}        []
 */
let copyFile = (source, target, replace, showWarning) => {

  if(showWarning === undefined){
    showWarning = true;
  }

  if(helper.isBoolean(replace)){
    showWarning = replace;
    replace = '';
  }

  //if target file is exist, ignore it
  if(helper.isFile(target)){
    if(showWarning){
      log(colors => {
        return colors.yellow('exist') + ' : ' + path.normalize(target);
      });
    }
    return;
  }

  mkdir(path.dirname(target));

  
  //if source file is not exist
  if(!helper.isFile(templatePath + path.sep + source)){
    return;
  }

  let content = fs.readFileSync(templatePath + path.sep + source, 'utf8');
  //replace content 
  if(helper.isObject(replace)){
    for(let key in replace){
      /*eslint-disable no-constant-condition*/
      while(1){ 
        let content1 = content.replace(key, replace[key]);
        if(content1 === content){
          content = content1;
          break;
        }
        content = content1;
      }
    }
  }

  fs.writeFileSync(target, content);
  log(colors => {
    return colors.cyan('create') + ' : ' + path.relative(cwd, target);
  });
};

/**
 * check is thinkjs app
 * @param  {String}  projectRootPath []
 * @return {Boolean}             []
 */
let isThinkApp = projectRootPath => {
  if(helper.isDirectory(projectRootPath)){
    let filepath = projectRootPath + '/src';
    if(helper.isFile(filepath)){
      return true;
    }
    const list = ['src', 'view', 'development.js', 'production.js'];
    return list.every(item => {
      const filepath = path.join(projectRootPath, item);
      return helper.isFile(filepath) || helper.isDirectory(filepath);
    })
  }
  return false;
};
/**
 * is module exist
 * @param  {String}  module []
 * @return {Boolean}        []
 */
let isModuleExist = m => {
  let modelPath = getPath(m, 'model');
  return helper.isDirectory(modelPath);
};
/**
 * parse app config
 * @param  {} projectRootPath []
 * @return {}             []
 */
let parseAppConfig = () => {
  let filepath = path.join(projectRootPath, 'src/common');
  if(helper.isDirectory(filepath)){
    mode = 'module';
  }
  appPath = getProjectAppPath();
};

/**
 * get view root path;
 * @return {String}             []
 */
let getProjectViewPath = (m) => {
  if(mode === 'module'){
    return path.join(projectRootPath, 'view', m);
  }
  return path.join(projectRootPath, 'view');
};

/**
 * check env
 * @return {} []
 */
let _checkEnv = () => {
  if(!isThinkApp('./')){
    console.log();
    log(colors => {
      return colors.red('current path is not thinkjs project.\n');
    });
    process.exit();
  }
  parseAppConfig();
  console.log();
};

/**
 * copy common files
 * @param  {String} projectRootPath []
 * @return {}             []
 */
let _copyWwwFiles = () => {
  mkdir(projectRootPath);

  copyFile('package.json', projectRootPath + '/package.json');

  let ROOT_PATH = projectRootPath + '/www';
  copyFile('nginx.conf', projectRootPath + '/nginx.conf', {
    '<ROOT_PATH>': ROOT_PATH
  });

  copyFile('pm2.json', projectRootPath + '/pm2.json', {
    '<ROOT_PATH>': path.dirname(ROOT_PATH),
    '<APP_NAME>': getAppName()
  });

  copyFile('eslintrc.log', projectRootPath + '/.eslintrc');
  copyFile('gitignore.log', projectRootPath + '/.gitignore');
  copyFile('README.md', projectRootPath + '/README.md');


  mkdir(projectRootPath + '/www');
  copyFile('development.js', projectRootPath + '/development.js');
  copyFile('production.js', projectRootPath + '/production.js');

  mkdir(projectRootPath + '/www/static/');
  mkdir(projectRootPath + '/www/static/js');
  mkdir(projectRootPath + '/www/static/css');
  mkdir(projectRootPath + '/www/static/img');
};

/**
 * copy common config files
 * @return {}             []
 */
let _copyCommonConfigFiles = () => {
  let rootPath = getPath('common', 'config');
  mkdir(rootPath);

  copyFile('src/config/config.js', rootPath + '/config.js', false);
  copyFile('src/config/adapter.js', rootPath + '/adapter.js');
  copyFile('src/config/config.production.js', rootPath + '/config.production.js');
  copyFile('src/config/extend.js', rootPath + '/extend.js');
  copyFile('src/config/middleware.js', rootPath + '/middleware.js');
  copyFile('src/config/router.js', rootPath + '/router.js');
  copyFile('src/config/adapter/cache.js', rootPath + '/adapter/cache.js');
  copyFile('src/config/adapter/model.js', rootPath + '/adapter/model.js');
  copyFile('src/config/adapter/session.js', rootPath + '/adapter/session.js');
  copyFile('src/config/adapter/view.js', rootPath + '/adapter/view.js');
};
/**
 * copy bootstrap files
 * @return {}             []
 */
let _copyCommonBootstrapFiles = () => {
  let rootPath = getPath('common', 'bootstrap');
  mkdir(rootPath);

  copyFile('src/bootstrap/master.js', rootPath + '/master.js');
  copyFile('src/bootstrap/worker.js', rootPath + '/worker.js');
};


/**
 * create module
 * @param  {String} module      []
 * @return {}             []
 */
let _createModule = m => {
  if(mode !== 'module' && m !== 'home'){
    log(colors => {
      return colors.red('app mode is not module, can not create module.\n');
    });
    process.exit();
  }
  if(isModuleExist(m)){
    log(colors => {
      return colors.red('module `' + m + '` is exist.\n');
    });
    process.exit();
  }
  
  //config files
  let configPath = getPath(m, 'config');
  mkdir(configPath);
  copyFile('src/config/config.js', configPath + '/config.js', false);

  //controller files
  let controllerPath = getPath(m, 'controller');
  mkdir(controllerPath);
  copyFile('src/controller/base.js', controllerPath + '/base.js');
  copyFile('src/controller/index.js', controllerPath + '/index.js');

  //logic files
  let logicPath = getPath(m, 'logic');
  mkdir(logicPath);
  copyFile('src/logic/index.js', logicPath + '/index.js');

  //model files
  let modelPath = getPath(m, 'model');
  mkdir(modelPath);
  copyFile('src/model/index.js', modelPath + '/index.js', false);

  //view files
  let viewPath = getProjectViewPath(m);
  mkdir(viewPath);
  copyFile('view/index_index.html', viewPath + '/index_index.html');
};

/**
 * create module
 * @param  {} module []
 * @return {}        []
 */
let createModule = module => {
  _checkEnv();

  if(module === 'common'){
    return;
  }
  
  _createModule(module);
};
/**
 * create controller
 * @param  {} controller []
 * @return {}            []
 */
let createController = controller => {
  _checkEnv();

  controller = controller.split('/');
  let m = 'common';
  if(controller.length >= 2){
    m = controller[0];
    controller = controller.slice(1).join('/');
  }else{
    controller = controller[0];
  }

  if(!isModuleExist(m)){
    createModule(m);
  }

  let controllerPath = getPath(m, 'controller');
  let file = 'index.js';
  copyFile('src/controller/' + file, controllerPath + '/' + controller + '.js');

  let logicPath = getPath(m, 'logic');
  copyFile('src/logic/index.js', logicPath + '/' + controller + '.js');

  console.log();
};

/**
 * create service
 * @param  {} controller []
 * @return {}            []
 */
let createService = service => {
  _checkEnv();

  service = service.split('/');
  let module = 'common';
  if(service.length === 2){
    module = service[0];
    service = service[1];
  }else{
    service = service[0];
  }

  if(!isModuleExist(module)){
    createModule(module);
  }

  let servicePath = getPath(module, 'service');
  copyFile('src/service/index.js', servicePath + '/' + service + '.js');

  console.log();
};
/**
 * create model file
 * @param  {String} model []
 * @return {}       []
 */
let createModel = model => {
  _checkEnv();

  model = model.split('/');
  let module = 'common';
  if(model.length === 2){
    module = model[0];
    model = model[1];
  }else{
    model = model[0];
  }

  if(!isModuleExist(module)){
    createModule(module);
  }

  let modelPath = getPath(module, 'model');
  copyFile('src/model/index.js', modelPath + '/' + model + '.js');

  console.log();
};

/**
 * create middleware
 * @param  {String} middleware []
 * @return {[type]}            []
 */
let createMiddleware = middleware => {
  _checkEnv();
  let midlewarePath = getPath('common', 'middleware');
  let filepath = midlewarePath + '/' + middleware + '.js';
  mkdir(midlewarePath);
  copyFile('src/middleware/base.js', filepath);

  console.log();
};

/**
 * create adapter
 * @param  {String} adatper []
 * @return {}         []
 */
let createAdapter = adapter => {
  _checkEnv();

  adapter = adapter.split('/');

  let type = adapter[0];
  let name = adapter[1] || 'base';

  let adapterPath = getPath('common', 'adapter');

  copyFile('src/adapter/base.js', adapterPath + '/' + type + '/' + name + '.js');

  console.log();
};

/**
 * module app
 * @param  {} projectRootPath []
 * @return {}             []
 */
let _createProject = () => {

  _copyWwwFiles();

  mkdir(appPath);

  _copyCommonBootstrapFiles();
  _copyCommonConfigFiles();

  _createModule('home');

};
/**
 * create project
 * @param  {String} projectRootPath []
 * @return {}             []
 */
let createProject = () => {
  if(isThinkApp(projectRootPath)){
    console.log();
    log(colors => {
      return colors.red('path `' + projectRootPath + '` is already a thinkjs project.\n');
    });
    return;
  }
  console.log();

  appPath = getProjectAppPath();
  _createProject();


  let p = projectRootPath.slice(cwd.length);
  if(p[0] === path.sep){
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
};

/**
 * display thinkjs version
 * @return {} []
 */
let displayVersion = () => {
  let version = getVersion();
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
};


commander.usage('[command] <options ...>');
commander.option('-v, --version', 'output the version number', () => {
  displayVersion();
});
commander.option('-V', 'output the version number', () => {
  displayVersion();
});
commander.option('-m, --mode <mode>', 'project mode type(normal, module), default is normal, using in `new` command', m => {
  mode = m;
});

//create project
commander.command('new <projectPath>').description('create project').action(projectPath => {
  projectRootPath = path.resolve(projectRootPath, projectPath);
  createProject();
});

//create module
commander.command('module <moduleName>').description('add module').action(m => {
  createModule(m.toLowerCase());
});

//create controlelr
commander.command('controller <controllerName>').description('add controller').action(controller => {
  createController(controller.toLowerCase());
});

//create service
commander.command('service <serviceName>').description('add service').action(service => {
  createService(service.toLowerCase());
});

//create model
commander.command('model <modelName>').description('add model').action(model => {
  createModel(model.toLowerCase());
});

//create middleware
commander.command('middleware <middlewareName>').description('add middleware').action(middleware => {
  createMiddleware(middleware.toLowerCase());
});

//create adapter
commander.command('adapter <adapterName>').description('add adapter').action(adapter => {
  createAdapter(adapter.toLowerCase());
});


commander.parse(process.argv);  