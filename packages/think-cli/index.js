var helper = require('think-helper');
var commander  = require('commander');
var directiveCollector = require('./directives/directiveCollector');
var tsDirective = require('./directives/tsDirective');

var fs = require('fs');
var path = require('path');
var colors = require('colors/safe');
var cwd = process.cwd();
//var templatePath = path.dirname(__dirname) + sep + 'template';
var projectRootPath = cwd; //project root path
const excludeFile = /^\./;
const configTreeFile = /.file$/;
const configTreeDir = /.dir$/
//const fs_readdir = helper.promisify(fs.readdir, fs);
var excludeDir = [];

function errlog(msg) {
  console.log(colors.red.underline(msg));
}
/**
 * copyProject
 * source
 * target
 */
function copyProject(source, target) {
  helper.mkdir(projectRootPath);
  copyDir(source, target);
  console.log(colors.green('project create succeed'));
}
/**
 * copyFile
 * source
 * target
 */
function copyFile(source, target) {
  let content = fs.readFileSync(source, 'utf8');
  fs.writeFileSync(target, content);
}

/**
 * copyDir
 * source
 * target
 */
function copyDir(source, target) {
  fs.readdir(source, function(err, files) {
    if(err) {
      errlog(err);
    }
    files.forEach((filePath)=>{
      let currentSourcePath = path.resolve(source, filePath);
      let targetSourcePath = path.resolve(target, filePath);

      if(!excludeFile.test(filePath)) {

        let handleResult = excludeHandle(targetSourcePath);

        if(handleResult) {
          privateFunc[handleResult.directive](currentSourcePath, targetSourcePath);
        } else {
          if(helper.isDirectory(currentSourcePath)) {
            helper.mkdir(targetSourcePath);
            return copyDir(currentSourcePath, targetSourcePath);
          } else {
            return copyFile(currentSourcePath, targetSourcePath);
          }
        }
      }
    })  
  })
}
/**
 * copyDir
 * filePath
 */
function excludeHandle(filePath) {
  return excludeDir.filter((item)=>{
    if(item.path === filePath) {
      return item;
    }
  })[0];
}
/**
 * createProject
 * projectPath
 */
function createProject(projectPath) {
  if(helper.isDirectory(projectRootPath)) {
    errlog(projectPath +' is already exist in current path');
    return;
  }
  copyProject(path.resolve(__dirname, 'template'), projectRootPath);
}


/**
 * privateFunc use in cli
 */
var privateFunc = {
  createConfig: function(currentSourcePath, targetSourcePath) {
     var configFilePath = path.resolve(cwd, 'think.json');
     fs.readFile(configFilePath, function(err, data) {
      if(err) {
        errlog(err)
      }
      var configTree = JSON.parse(data);

      function handleConfig(currentSourcePath, targetSourcePath, config) {
        
        targetSourcePath = targetSourcePath.replace(configTreeDir, '')
        helper.mkdir(targetSourcePath);
        
        for(var i in config) {
          let fileName = i.replace(configTreeFile, '');
          var source = path.resolve(currentSourcePath, fileName);
          var target = path.resolve(targetSourcePath, fileName);
          if(helper.isString(config[i])) {
            fs.writeFileSync(target, config[i], 'utf8');
          } else {
            handleConfig(source, target, config[i]);
          }
        }
      }
      handleConfig(currentSourcePath, targetSourcePath, configTree);
     })
  },

  handleConfig: function() {
    let configPath = path.join(projectRootPath, 'config');

    excludeDir.push({
      'path': configPath,
      'directive': 'createConfig'
    });
  },

  createTsConfig: function(currentSourcePath, targetSourcePath) {
    tsDirective(currentSourcePath, targetSourcePath);
  },

  handleTsConfig: function() {
    let entryFileList = ['development.js', 'production.js', 'testing.js'];

    entryFileList.forEach((item)=>{
      let configPath = path.join(projectRootPath, item);

      excludeDir.push({
        'path': configPath,
        'directive': 'createTsConfig'
      });
    })
  }
}
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
 * display thinkjs version
 * @return {} []
 */
var displayVersion = () => {
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

commander.option('-v, --version', 'output the version number', () => {
  displayVersion();
});


commander.command('new <projectPath> [config]')
         .description('create project')
         .action((projectPath, config) => {
            projectRootPath = path.resolve(projectRootPath, projectPath);
            if(config === 'config') {
              privateFunc.handleConfig();
            }
            if(config === 'ts') {
              privateFunc.handleTsConfig();
            }
            createProject(projectPath);
        });

commander.command('create <mode> [name]')
         .description('create all kinds of modes in your project')
         .action((mode, name) => {
            directiveCollector(mode, name, projectRootPath);
        });

commander.parse(process.argv);
