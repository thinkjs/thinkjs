// thinkjs command

import fs from 'fs';
import path from 'path';
import commander from 'commander';
import './core/think.js';

let {sep} = path;
let cwd = process.cwd();
let templatePath = path.dirname(__dirname) + sep + 'template';
let projectRootPath = cwd; //project root path
let modeList = ['normal', 'module'];

think.mode = think.mode_module;


/**
 * get date time
 * @return {} []
 */
let getDateTime = () => {
  let fn = d => {
    return ('0' + d).slice(-2);
  };
  let d = new Date();
  let date = d.getFullYear() + '-' + fn(d.getMonth() + 1) + '-' + fn(d.getDate());
  let time = fn(d.getHours()) + ':' + fn(d.getMinutes()) + ':' + fn(d.getSeconds());
  return date + ' ' + time;
};
/**
 * log
 * @param  {Function} fn []
 * @return {}      []
 */
let log = fn => {
  think.log(colors => {
    return '  ' + fn(colors);
  }, '', null); 
};

/**
 * mkdir
 * @param  {String} dir []
 * @return {}     []
 */
let mkdir = dir => {
  if(think.isDir(dir)){
    return;
  }
  think.mkdir(dir);
  log(colors => {
    return colors.cyan('create') + ' : ' + path.relative(cwd, dir);
  });
};

/**
 * get version
 * @return {String} []
 */
let getVersion = () => {
  let filepath = path.resolve(__dirname, '../package.json');
  let version = JSON.parse(fs.readFileSync(filepath)).version;
  return version;
};

/**
 * get app root path
 * @return {} []
 */
let getProjectAppPath = () => {
  let path = projectRootPath + think.sep;
  path += !commander.es5 || commander.ts ? 'src' : 'app';
  return path;
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

  if(think.isBoolean(replace)){
    showWarning = replace;
    replace = '';
  }

  //if target file is exist, ignore it
  if(think.isFile(target)){
    if(showWarning){
      log(colors => {
        return colors.yellow('exist') + ' : ' + path.normalize(target);
      });
    }
    return;
  }

  mkdir(path.dirname(target));

  let es5 = commander.es5;

  //TypeScript
  if(commander.ts){
    let tsSource = source.replace(/\.\w+$/, a => {
      return a === '.js' ? '.ts' : '_ts' + a;
    });
    if(think.isFile(templatePath + '/' + tsSource)){
      source = tsSource;
    }
    if(target.indexOf(think.sep + 'src' + think.sep) > -1){
      //replace target file extname to .ts
      target = target.replace(/\.js$/, '.ts');
    }
  }
  //ECMAScript 2015/2016
  else if(!es5){
    let esSource = source.replace(/\.\w+$/, a => {
      return a === '.js' ? '.es' : '_es' + a;
    });
    if(think.isFile(templatePath + think.sep + esSource)){
      source = esSource;
    }
  }

  //if source file is not exist
  if(!think.isFile(templatePath + think.sep + source)){
    return;
  }

  let content = fs.readFileSync(templatePath + think.sep + source, 'utf8');
  //replace content 
  if(think.isObject(replace)){
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
  if(think.isDir(projectRootPath)){
    let filepath = projectRootPath + '/.thinkjsrc';
    if(think.isFile(filepath)){
      return true;
    }
  }
  return false;
};
/**
 * is module exist
 * @param  {String}  module []
 * @return {Boolean}        []
 */
let isModuleExist = module => {
  let modelPath = think.getPath(module, 'model');
  // if(think.mode === think.mode_normal){
  //   modelPath = think.getPath(module, 'controller');
  // }
  return think.isDir(modelPath);
};
/**
 * parse app config
 * @param  {} projectRootPath []
 * @return {}             []
 */
let parseAppConfig = () => {
  let filepath = projectRootPath + '/.thinkjsrc';
  let content = fs.readFileSync(filepath, 'utf8');
  let data = JSON.parse(content);

  commander.ts = data.ts;
  //commander.es = data.es || data.es6; //compatible with 2.0.x
  think.mode = think['mode_' + data.mode];

  think.APP_PATH = getProjectAppPath();
};

/**
 * get view root path;
 * @return {String}             []
 */
let getProjectViewPath = module => {
  let APP_PATH = think.APP_PATH;

  think.APP_PATH = projectRootPath + '/view';

  //read view config, view root_path may be changed it.
  let viewConfigFile = projectRootPath + '/app/common/config/view.js';
  if(think.mode === think.mode_normal){
    viewConfigFile = projectRootPath + '/app/config/view.js';
  }
  think.ROOT_PATH = projectRootPath;
  if(think.isFile(viewConfigFile)){
    let data = require(viewConfigFile);
    let viewRootPath = path.normalize(data.root_path || data.default && data.default.root_path);
    think.APP_PATH = viewRootPath;
  }
  let viewPath = think.getPath(module, '');


  think.APP_PATH = APP_PATH;
  return path.normalize(viewPath).slice(0, -1);
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

  let name = commander.test ? 'package_test' : 'package';
  copyFile(name + '.json', projectRootPath + '/package.json');

  copyFile('.babelrc', projectRootPath + '/.babelrc');

  let mode = 'normal';
  if(think.mode === think.mode_module){
    mode = 'module';
  }
  copyFile('thinkjsrc.json', projectRootPath + '/.thinkjsrc', {
    '<createAt>': getDateTime(),
    '<mode>': mode
  });

  let ROOT_PATH = projectRootPath + '/www';
  copyFile('nginx.conf', projectRootPath + '/nginx.conf', {
    '<ROOT_PATH>': ROOT_PATH
  });

  copyFile('pm2.json', projectRootPath + '/pm2.json', {
    '<ROOT_PATH>': path.dirname(ROOT_PATH),
    '<APP_NAME>': getAppName()
  });

  copyFile('gitignore.log', projectRootPath + '/.gitignore');
  copyFile('README.md', projectRootPath + '/README.md');

  if(commander.ts){
    copyFile('bin/compile.ts', projectRootPath + '/bin/compile.js');
    copyFile('think.d.ts', projectRootPath + '/typings/thinkjs/think.d.ts');
  }

  mkdir(projectRootPath + '/www');
  copyFile('www/development.js', projectRootPath + '/www/development.js');
  copyFile('www/production.js', projectRootPath + '/www/production.js');
  copyFile('www/testing.js', projectRootPath + '/www/testing.js');
  copyFile('www/README.md', projectRootPath + '/www/README.md');

  mkdir(projectRootPath + '/www/static/');
  mkdir(projectRootPath + '/www/static/js');
  mkdir(projectRootPath + '/www/static/css');
  mkdir(projectRootPath + '/www/static/img');
};
/**
 * copy error template files
 * @param  {String} projectRootPath []
 * @return {}             []
 */
let _copyErrorTemplateFiles = () => {

  let module = 'common';
  if(think.mode === think.mode_normal){
    module = 'home';
  }

  let controllerPath = think.getPath(module, 'controller');
  mkdir(controllerPath);
  copyFile('controller/error.js', controllerPath + '/error.js');

  let commonViewPath = getProjectViewPath(module);

  mkdir(commonViewPath);
  copyFile('view/error_400.html', commonViewPath + '/error_400.html');
  copyFile('view/error_403.html', commonViewPath + '/error_403.html');
  copyFile('view/error_404.html', commonViewPath + '/error_404.html');
  copyFile('view/error_500.html', commonViewPath + '/error_500.html');
  copyFile('view/error_503.html', commonViewPath + '/error_503.html');
};

let getSecret = length => {
  length = length || 8;
  let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()`1234567890';
  let arr = str.split('').sort(() => {
    return Math.random() >= 0.5 ? 1 : -1;
  }).slice(0, length);
  return arr.join('');
};
/**
 * copy common config files
 * @return {}             []
 */
let _copyCommonConfigFiles = () => {
  let rootPath = think.getPath('common', 'config');
  mkdir(rootPath);

  copyFile('config/config.js', rootPath + '/config.js', false);
  copyFile('config/view.js', rootPath + '/view.js');
  copyFile('config/db.js', rootPath + '/db.js');
  copyFile('config/hook.js', rootPath + '/hook.js');
  copyFile('config/session.js', rootPath + '/session.js', {
    '<SECRET>': getSecret()
  });
  copyFile('config/error.js', rootPath + '/error.js');

  mkdir(rootPath + '/env');
  copyFile('config/env/development.js', rootPath + '/env/development.js');
  copyFile('config/env/testing.js', rootPath + '/env/testing.js');
  copyFile('config/env/production.js', rootPath + '/env/production.js');

  mkdir(rootPath + '/locale');
  copyFile('config/locale/en.js', rootPath + '/locale/en.js');
};
/**
 * copy bootstrap files
 * @return {}             []
 */
let _copyCommonBootstrapFiles = () => {
  let rootPath = think.getPath('common', 'bootstrap');
  mkdir(rootPath);

  copyFile('bootstrap/middleware.js', rootPath + '/middleware.js');
  copyFile('bootstrap/global.js', rootPath + '/global.js');
};


/**
 * create module
 * @param  {String} module      []
 * @return {}             []
 */
let _createModule = module => {
  if(think.mode !== think.mode_module && module !== 'home'){
    log(colors => {
      return colors.red('app mode is not module, can not create module.\n');
    });
    process.exit();
  }
  if(isModuleExist(module)){
    log(colors => {
      return colors.red('module `' + module + '` is exist.\n');
    });
    process.exit();
  }
  
  //config files
  let configPath = think.getPath(module, 'config');
  mkdir(configPath);
  copyFile('config/config.js', configPath + '/config.js', false);

  //controller files
  let controllerPath = think.getPath(module, 'controller');
  mkdir(controllerPath);
  copyFile('controller/base.js', controllerPath + '/base.js');
  copyFile('controller/index.js', controllerPath + '/index.js');

  //logic files
  let logicPath = think.getPath(module, 'logic');
  mkdir(logicPath);
  copyFile('logic/index.js', logicPath + '/index.js');

  //model files
  let modelPath = think.getPath(module, 'model');
  mkdir(modelPath);
  copyFile('model/index.js', modelPath + '/index.js', false);

  //view files
  let viewPath = getProjectViewPath(module);
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
  let module = 'common';
  if(controller.length >= 2){
    module = controller[0];
    controller = controller.slice(1).join('/');
  }else{
    controller = controller[0];
  }

  if(!isModuleExist(module)){
    createModule(module);
  }

  let controllerPath = think.getPath(module, 'controller');
  let file = 'index.js';
  if(commander.rest){
    file = 'rest.js';
  }
  copyFile('controller/' + file, controllerPath + '/' + controller + '.js');

  let logicPath = think.getPath(module, 'logic');
  copyFile('logic/index.js', logicPath + '/' + controller + '.js');

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

  let servicePath = think.getPath(module, 'service');
  copyFile('service/index.js', servicePath + '/' + service + '.js');

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

  let file = 'index.js';
  if(commander.relation){
    file = 'relation.js';
  }else if(commander.mongo){
    file = 'mongo.js';
  }
  let controllerPath = think.getPath(module, 'model');
  copyFile('model/' + file, controllerPath + '/' + model + '.js');

  console.log();
};

/**
 * create middleware
 * @param  {String} middleware []
 * @return {[type]}            []
 */
let createMiddleware = middleware => {
  _checkEnv();
  let midlewarePath = think.getPath('common', 'middleware');
  let filepath = midlewarePath + '/' + middleware + '.js';
  mkdir(midlewarePath);
  copyFile('middleware/base.js', filepath);

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

  let adapterPath = think.getPath('common', 'adapter');

  copyFile('adapter/base.js', adapterPath + '/' + type + '/' + name + '.js');

  console.log();
};

/**
 * module app
 * @param  {} projectRootPath []
 * @return {}             []
 */
let _createProject = () => {

  _copyWwwFiles();

  mkdir(think.APP_PATH);

  _copyCommonBootstrapFiles();
  _copyCommonConfigFiles();
  _copyErrorTemplateFiles();

  _createModule('home');

  if(commander.test){
    copyFile('test/index.js', projectRootPath + '/test/index.js');
  }
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

  think.APP_PATH = getProjectAppPath();
  _createProject();


  let p = projectRootPath.slice(cwd.length);
  if(p[0] === think.sep){
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
 * create plugin
 * @return {} []
 */
let createPlugin = () => {
  console.log();
  
  mkdir(projectRootPath);

  let pluginName = path.basename(projectRootPath).toLowerCase();
  pluginName = pluginName.replace(/\_/g, '-');
  if(pluginName[0] === '-'){
    pluginName = pluginName.slice(1);
  }
  if(pluginName.indexOf('think-') !== 0){
    pluginName = 'think-' + pluginName;
  }

  copyFile('plugin/src/index.js', projectRootPath + '/src/index.js');
  copyFile('plugin/test/index.js', projectRootPath + '/test/index.js', {
    '<PLUGIN_NAME>': pluginName
  });
  copyFile('plugin/.eslintrc', projectRootPath + '/.eslintrc');
  copyFile('plugin/gitignore', projectRootPath + '/.gitignore');
  copyFile('plugin/.npmignore', projectRootPath + '/.npmignore');
  copyFile('plugin/.travis.yml', projectRootPath + '/.travis.yml');
  copyFile('plugin/package.json', projectRootPath + '/package.json', {
    '<PLUGIN_NAME>': pluginName
  });
  copyFile('plugin/README.md', projectRootPath + '/README.md', {
    '<PLUGIN_NAME>': pluginName
  });

  console.log();
  console.log('  enter path:');
  console.log('  $ cd ' + projectRootPath);
  console.log();

  console.log('  install dependencies:');
  console.log('  $ npm install');
  console.log();

  console.log('  watch compile:');
  console.log('  $ npm run watch-compile');
  console.log();

  console.log('  run test:');
  console.log('  $ npm run test-cov');

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
commander.option('--es5', 'use es5 for project, used in `new` command');
commander.option('-t, --ts', 'use TypeScript for project, used in `new` command');
commander.option('-T, --test', 'add test dirs when create project, used in `new` command');
commander.option('-r, --rest', 'create rest controller, used in `controller` command');
commander.option('-M, --mongo', 'create mongo model, used in `model` command');
commander.option('-R, --relation', 'create relation model, used in `model` command');
commander.option('-m, --mode <mode>', 'project mode type(normal, module), default is module, used in `new` command', mode => {
  if(modeList.indexOf(mode) === -1){
    console.log('mode value must one of ' + modeList.join(', '));
    process.exit();
  }
  think.mode = think['mode_' + mode];
});

//create project
commander.command('new <projectPath>').description('create project').action(projectPath => {
  projectRootPath = path.resolve(projectRootPath, projectPath);
  //commander.es = commander.es || commander.es6;
  createProject();
});

//create module
commander.command('module <moduleName>').description('add module').action(module => {
  createModule(module.toLowerCase());
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

//create plugin
commander.command('plugin <pluginPath>').description('create ThinkJS plugin').action(pluginPath => {
  projectRootPath = path.resolve(projectRootPath, pluginPath);
  
  createPlugin();
});

commander.parse(process.argv);  