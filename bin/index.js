'use strict';

var fs = require('fs');
var path = require('path');
var program = require('commander');


var cwd = process.cwd();
var templatePath = path.dirname(__dirname) + '/template';
var modeType = 'module';
var modeTypeList = ['mini', 'normal', 'module'];




require('../lib/core/think.js');

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
}

/**
 * get version
 * @return {String} []
 */
var getVersion = function(){
  var filepath = path.normalize(__dirname + '/../package.json');
  var version = JSON.parse(fs.readFileSync(filepath)).version;
  return version;
};
/**
 * copy file
 * @param  {String} source []
 * @param  {String} target []
 * @return {}        []
 */
var copyFile = function(source, target, replace){
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

  if(replace){
    for(var key in replace){
      content = content.replace(key, replace[key]);
    }
  }

  fs.writeFileSync(target, content);
  think.log(function(colors){
    return colors.green('create') + ' : ' + target;
  });
}
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
  think.log(function(colors){
    return colors.green('create') + ' : ' + dir;
  });
}
/**
 * create project
 * @param  {String} projectPath []
 * @return {}             []
 */
var createProject = function(projectPath){
  //check path
  if(think.isDir(projectPath)){
    var filepath = projectPath + '/.thinkjsrc';
    if(think.isFile(filepath)){
      console.log();
      think.log(function(colors){
        return colors.red('path `' + projectPath + '` is already a thinkjs project.\n');
      });
      return;
    }
  }
  console.log();

  copyCommonFiles(projectPath);

  switch(modeType){
    case 'module': 
      createModuleApp(projectPath);
      break;
    case 'normal':
      createNormalApp(projectPath);
      break;
    case 'mini':
      createMiniApp(projectPath);
      break;
  }

  console.log();
};
/**
 * get app root path
 * @return {} []
 */
var getAppRootPath = function(projectPath){
  var path = projectPath;
  path += program.es6 ? 'src' : 'app';
  return path;
}
/**
 * get view root path;
 * @param  {String} projectPath []
 * @return {String}             []
 */
var getViewRootPath = function(projectPath, module){
  var path = projectPath;
  if(program.es6){
    path += 'view/' + module;
  }else{
    path += 'app/' + module + '/view';
  }
  return path;
}
/**
 * copy common files
 * @param  {String} projectPath []
 * @return {}             []
 */
var copyCommonFiles = function(projectPath){
  mkdir(projectPath);

  copyFile('package.json', projectPath + 'package.json');
  copyFile('.thinkjsrc', projectPath + '.thinkjsrc', {
    "<createAt>": getDateTime(),
    "<mode>": modeType,
    '"<es6>"': !!program.es6
  });
  copyFile('nginx.conf', projectPath + 'nginx.conf', {
    ROOT_PATH: cwd + '/' + projectPath + 'www'
  });

  mkdir(projectPath + 'www/');
  copyFile('entrance/index.js', projectPath + 'www/index.js');
  copyFile('entrance/production.js', projectPath + 'www/production.js');
  copyFile('entrance/testing.js', projectPath + 'www/testing.js');
  copyFile('entrance/README.md', projectPath + 'www/README.md');

  mkdir(projectPath + 'www/static/');
  mkdir(projectPath + 'www/static/js');
  mkdir(projectPath + 'www/static/css');
  mkdir(projectPath + 'www/static/img');
}
/**
 * module app
 * @param  {} projectPath []
 * @return {}             []
 */
var createModuleApp = function(projectPath){
  var rootPath = getAppRootPath(projectPath);

  mkdir(rootPath);
  mkdir(rootPath + '/common');
  mkdir(rootPath + '/common/runtime');

  mkdir(rootPath + '/common/bootstrap');
  copyFile('bootstrap/hook.js', rootPath + '/common/bootstrap/hook.js');
  copyFile('bootstrap/start.js', rootPath + '/common/bootstrap/start.js');

  mkdir(rootPath + '/common/config');
  copyFile('config/config.js', rootPath + '/common/config/config.js');
  copyFile('config/tpl.js', rootPath + '/common/config/tpl.js');
  copyFile('config/db.js', rootPath + '/common/config/db.js');

  mkdir(rootPath + '/common/controller');
  copyFile('controller/error.js', rootPath + '/common/controller/error.js');

  var commonViewPath = getViewRootPath(projectPath, 'common');
  mkdir(commonViewPath);
  copyFile('view/error_403.html', commonViewPath + '/error_403.html');
  copyFile('view/error_404.html', commonViewPath + '/error_404.html');
  copyFile('view/error_500.html', commonViewPath + '/error_500.html');
  copyFile('view/error_503.html', commonViewPath + '/error_503.html');


  mkdir(rootPath + '/home/');
  mkdir(rootPath + '/home/config');
  copyFile('config/config.js', rootPath + '/home/config/config.js');

  mkdir(rootPath + '/home/controller');
  copyFile('controller/base.js', rootPath + '/home/controller/base.js');
  copyFile('controller/index.js', rootPath + '/home/controller/index.js');

  mkdir(rootPath + '/home/logic');
  copyFile('logic/index.js', rootPath + '/home/logic/index.js');


  mkdir(rootPath + '/home/model');
  copyFile('model/index.js', rootPath + '/home/model/index.js');
  var commonViewPath = getViewRootPath(projectPath, 'home');
  mkdir(commonViewPath);
  copyFile('view/index_index.html', commonViewPath + '/index_index.html');
  
}
/**
 * create mini app
 * @param  {} projectPath []
 * @return {}             []
 */
var createMiniApp = function(projectPath){
  
}



program.version(getVersion()).usage('[command] <options ...>');
program.option('-e, --es6', 'use es6 for project, used in `new` command');
program.option('-r, --rest', 'create rest controller, used in `controller` command');
program.option('-M, --mongo', 'create rest model, used in `model` command');
program.option('-m, --mode <mode>', 'project mode type, used in `new` command', function(mode){
  if(modeTypeList.indexOf(mode) === -1){
    throw new Error('mode value must one of mini,normal,module');
  }
  modeType = mode;
});

//create project
program.command('new <projectPath>').description('create project').action(function(projectPath){
  projectPath = path.normalize(projectPath + '/');
  createProject(projectPath);
});

//create module
program.command('module <moduleName>').description('add module').action(function(module){

});

//create controlelr
program.command('controller <controllerName>').description('add controller').action(function(controller){

});

//create model
program.command('model <modelName>').description('add model').action(function(model){
  
});

program.parse(process.argv);