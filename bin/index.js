'use strict';

var fs = require('fs');
var path = require('path');
var program = require('commander');


var cwd = process.cwd();
var templatePath = path.dirname(__dirname) + '/template';
var projectRootPath = './'; //project root path
var modeList = ['mini', 'normal', 'module'];

require('../lib/core/think.js');

think.mode = think.mode_module;

/**
 * get date time
 * @return {} []
 */
var getDateTime = function(){
  var fn = function(d) {
    return ('0' + d).slice(-2);
  };
  var d = new Date();
  var date = d.getFullYear() + '-' + fn(d.getMonth() + 1) + '-' + fn(d.getDate());
  var time = fn(d.getHours()) + ':' + fn(d.getMinutes()) + ':' + fn(d.getSeconds());
  return date + ' ' + time;
};

var log = function(fn){
  think.log(function(colors){
    return '  ' + fn(colors);
  }, '', null); 
};

/**
 * mkdir
 * @param  {String} dir []
 * @return {}     []
 */
var mkdir = function(dir){
  if(think.isDir(dir)){
    return;
  }
  think.mkdir(dir);
  log(function(colors){
    return colors.cyan('create') + ' : ' + path.normalize(dir);
  });
};

/**
 * get version
 * @return {String} []
 */
var getVersion = function(){
  var filepath = path.resolve(__dirname, '../package.json');
  var version = JSON.parse(fs.readFileSync(filepath)).version;
  return version;
};

/**
 * get app root path
 * @return {} []
 */
var getProjectAppPath = function(){
  var path = projectRootPath;
  path += program.es6 ? 'src' : 'app';
  return path;
};
/**
 * get app name
 * @return {} []
 */
var getAppName = function(){
  var filepath = path.normalize(cwd + '/' + projectRootPath).replace(/\\/g, '');
  var matched = filepath.match(/([^\/]+)\/?$/);
  return matched[1];
};

/**
 * copy file
 * @param  {String} source []
 * @param  {String} target []
 * @return {}        []
 */
var copyFile = function(source, target, replace, showWarning){

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
      log(function(colors){
        return colors.yellow('exist') + ' : ' + path.normalize(target);
      });
    }
    return;
  }

  mkdir(path.dirname(target));

  if(program.es6){
    var es6Source = source.replace(/\/([^/]+)$/, function(a, b){
      return '/es6_' + b;
    });
    if(think.isFile(templatePath + '/' + es6Source)){
      source = es6Source;
    }
  }

  var content = fs.readFileSync(templatePath + '/' + source, 'utf8');
  //replace content 
  if(replace){
    for(var key in replace){
      content = content.replace(key, replace[key]);
    }
  }

  fs.writeFileSync(target, content);
  log(function(colors){
    return colors.cyan('create') + ' : ' + path.normalize(target);
  });
};

/**
 * check is thinkjs app
 * @param  {String}  projectRootPath []
 * @return {Boolean}             []
 */
var isThinkApp = function(projectRootPath){
  if(think.isDir(projectRootPath)){
    var filepath = projectRootPath + '.thinkjsrc';
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
var isModuleExist = function(module){
  var modelPath = think.getPath(module, 'model');
  if(think.mode === think.mode_normal){
    modelPath = think.getPath(module, 'controller');
  }
  return think.isDir(modelPath);
};
/**
 * parse app config
 * @param  {} projectRootPath []
 * @return {}             []
 */
var parseAppConfig = function(){
  var filepath = projectRootPath + '.thinkjsrc';
  var content = fs.readFileSync(filepath, 'utf8');
  var data = JSON.parse(content);

  program.es6 = data.es6;
  think.mode = think['mode_' + data.mode];

  think.APP_PATH = getProjectAppPath();
};

/**
 * get view root path;
 * @return {String}             []
 */
var getProjectViewPath = function(module){
  if(program.es6){
    var APP_PATH = think.APP_PATH;
    think.APP_PATH = projectRootPath + 'view';
    var viewPath = think.getPath(module, '');

    if(think.mode === think.mode_normal){
      viewPath += '/' + module + '/';
    }
    
    think.APP_PATH = APP_PATH;
    return path.normalize(viewPath).slice(0, -1);
  }else{
    return think.getPath(module, 'view');
  }
};

/**
 * check env
 * @return {} []
 */
var _checkEnv = function(){
  if(!isThinkApp('./')){
    console.log();
    log(function(colors){
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
var _copyWwwFiles = function(){
  mkdir(projectRootPath);

  copyFile('package.json', projectRootPath + 'package.json');

  var mode = 'mini';
  if(think.mode === think.mode_normal){
    mode = 'normal';
  }else if(think.mode === think.mode_module){
    mode = 'module';
  }
  copyFile('.thinkjsrc', projectRootPath + '.thinkjsrc', {
    '<createAt>': getDateTime(),
    '<mode>': mode,
    '"<es6>"': !!program.es6
  });

  var ROOT_PATH = cwd + '/' + projectRootPath + 'www';
  copyFile('nginx.conf', projectRootPath + 'nginx.conf', {
    '<ROOT_PATH>': ROOT_PATH
  });
  copyFile('nginx_ssl_http2.conf', projectRootPath + 'nginx_ssl_http2.conf', {
    '<ROOT_PATH>': ROOT_PATH
  });
  copyFile('pm2.json', projectRootPath + 'pm2.json', {
    '<ROOT_PATH>': ROOT_PATH,
    '<APP_NAME>': getAppName()
  });

  copyFile('.gitignore', projectRootPath + '.gitignore');
  copyFile('README.md', projectRootPath + 'README.md');


  mkdir(projectRootPath + 'www/');
  copyFile('www/index.js', projectRootPath + 'www/index.js');
  copyFile('www/production.js', projectRootPath + 'www/production.js');
  copyFile('www/testing.js', projectRootPath + 'www/testing.js');
  copyFile('www/README.md', projectRootPath + 'www/README.md');

  mkdir(projectRootPath + 'www/static/');
  mkdir(projectRootPath + 'www/static/js');
  mkdir(projectRootPath + 'www/static/css');
  mkdir(projectRootPath + 'www/static/img');
};
/**
 * copy error template files
 * @param  {String} projectRootPath []
 * @return {}             []
 */
var _copyErrorTemplateFiles = function(){

  var module = 'common';
  if(think.mode === think.mode_normal){
    module = 'home';
  }

  var controllerPath = think.getPath(module, 'controller');
  mkdir(controllerPath);
  copyFile('controller/error.js', controllerPath + '/error.js');

  var commonViewPath = getProjectViewPath(module);

  mkdir(commonViewPath);
  copyFile('view/error_400.html', commonViewPath + '/error_400.html');
  copyFile('view/error_403.html', commonViewPath + '/error_403.html');
  copyFile('view/error_404.html', commonViewPath + '/error_404.html');
  copyFile('view/error_500.html', commonViewPath + '/error_500.html');
  copyFile('view/error_503.html', commonViewPath + '/error_503.html');
};
/**
 * copy common config files
 * @return {}             []
 */
var _copyCommonConfigFiles = function(){
  var rootPath = think.getPath('common', 'config');
  mkdir(rootPath);

  copyFile('config/config.js', rootPath + '/config.js', false);
  copyFile('config/view.js', rootPath + '/view.js');
  copyFile('config/db.js', rootPath + '/db.js');

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
var _copyCommonBootstrapFiles = function(){
  var rootPath = think.getPath('common', 'bootstrap');
  mkdir(rootPath);

  copyFile('bootstrap/hook.js', rootPath + '/hook.js');
  copyFile('bootstrap/start.js', rootPath + '/start.js');
};


/**
 * create module
 * @param  {String} module      []
 * @return {}             []
 */
var _createModule = function(module){
  if(isModuleExist(module)){
    log(function(colors){
      return colors.red('module `' + module + '` is exist.\n');
    });
    process.exit();
  }
  
  //config files
  var configPath = think.getPath(module, 'config');
  mkdir(configPath);
  copyFile('config/config.js', configPath + '/config.js', false);

  //controller files
  var controllerPath = think.getPath(module, 'controller');
  mkdir(controllerPath);
  copyFile('controller/base.js', controllerPath + '/base.js');
  copyFile('controller/index.js', controllerPath + '/index.js');

  //logic files
  var logicPath = think.getPath(module, 'logic');
  mkdir(logicPath);
  copyFile('logic/index.js', logicPath + '/index.js');

  //model files
  var modelPath = think.getPath(module, 'model');
  mkdir(modelPath);
  copyFile('model/index.js', modelPath + '/index.js', false);

  //view files
  var viewPath = getProjectViewPath(module);
  mkdir(viewPath);
  copyFile('view/index_index.html', viewPath + '/index_index.html');
};

/**
 * create module
 * @param  {} module []
 * @return {}        []
 */
var createModule = function(module){
  _checkEnv();
  _createModule(module);
};
/**
 * create controller
 * @param  {} controller []
 * @return {}            []
 */
var createController = function(controller){
  _checkEnv();

  controller = controller.split('/');
  var module = 'home';
  if(controller.length === 2){
    module = controller[0];
    controller = controller[1];
  }else{
    controller = controller[0];
  }

  if(!isModuleExist(module)){
    _createModule(module);
  }

  var controllerPath = think.getPath(module, 'controller');
  var file = 'index.js';
  if(program.rest){
    file = 'rest.js';
  }
  copyFile('controller/' + file, controllerPath + '/' + controller + '.js');

  var logicPath = think.getPath(module, 'logic');
  copyFile('logic/index.js', logicPath + '/' + controller + '.js');

  console.log();
};
/**
 * create model file
 * @param  {String} model []
 * @return {}       []
 */
var createModel = function(model){
  _checkEnv();

  model = model.split('/');
  var module = 'home';
  if(model.length === 2){
    module = model[0];
    model = model[1];
  }else{
    model = model[0];
  }

  if(!isModuleExist(module)){
    _createModule(module);
  }

  var file = 'index.js';
  if(program.relation){
    file = 'relation.js';
  }else if(program.mongo){
    file = 'mongo.js';
  }
  var controllerPath = think.getPath(module, 'model');
  copyFile('model/' + file, controllerPath + '/' + model + '.js');

  console.log();
};

/**
 * module app
 * @param  {} projectRootPath []
 * @return {}             []
 */
var _createProject = function(){
  _copyWwwFiles();

  mkdir(think.APP_PATH);
  var runtimePath = think.getPath('common', 'runtime');
  mkdir(runtimePath);

  _copyCommonBootstrapFiles();
  _copyCommonConfigFiles();
  _copyErrorTemplateFiles();

  _createModule('home');
};
/**
 * create project
 * @param  {String} projectRootPath []
 * @return {}             []
 */
var createProject = function(){
  if(isThinkApp(projectRootPath)){
    console.log();
    log(function(colors){
      return colors.red('path `' + projectRootPath + '` is already a thinkjs project.\n');
    });
    return;
  }
  console.log();

  think.APP_PATH = getProjectAppPath();
  _createProject();

  console.log();
  console.log('  enter path:');
  console.log('  $ cd ' + projectRootPath);
  console.log();

  console.log('  install dependencies:');
  console.log('  $ npm install');
  console.log();

  if(program.es6){
    console.log('  watch compile:');
    console.log('  $ npm run watch-compile');
    console.log();
  }

  console.log('  run the app:');
  console.log('  $ npm start');

  console.log();
};



program.version(getVersion()).usage('[command] <options ...>');
program.option('-e, --es6', 'use es6 for project, used in `new` command');
program.option('-r, --rest', 'create rest controller, used in `controller` command');
program.option('-M, --mongo', 'create mongo model, used in `model` command');
program.option('-R, --relation', 'create relation model, used in `model` command');
program.option('-m, --mode <mode>', 'project mode type, used in `new` command', function(mode){
  if(modeList.indexOf(mode) === -1){
    throw new Error('mode value must one of ' + modeList.join(', '));
  }
  think.mode = think['mode_' + mode];
});

//create project
program.command('new <projectPath>').description('create project').action(function(projectPath){
  projectRootPath = path.normalize(projectPath + '/');
  createProject();
});

//create module
program.command('module <moduleName>').description('add module').action(function(module){
  createModule(module.toLowerCase());
});

//create controlelr
program.command('controller <controllerName>').description('add controller').action(function(controller){
  createController(controller.toLowerCase());
});

//create model
program.command('model <modelName>').description('add model').action(function(model){
  createModel(model.toLowerCase());
});

program.parse(process.argv);  