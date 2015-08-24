'use strict';

var fs = require('fs');
var path = require('path');
var program = require('commander');


var templatePath = path.dirname(__dirname) + '/template';

require('../lib/core/think.js');

var modeType = 'module';
var modeTypeList = ['mini', 'normal', 'module'];

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
var copyFile = function(source, target){
  mkdir(path.dirname(target));

  var content = fs.readFileSync(templatePath + '/' + source);
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

  mkdir(projectPath);


  console.log();
};




program.version(getVersion()).usage('[command] <options ...>');
program.option('-e, --es6', 'use es6 for project, in `new` command');
program.option('-m, --mode <mode>', 'project mode type, in `new` command', function(mode){
  if(modeTypeList.indexOf(mode) === -1){
    throw new Error('mode value must one of mini,normal,module');
  }
  modeType = mode;
});

//create project
program.command('new <projectPath>').description('create project').action(function(projectPath){
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