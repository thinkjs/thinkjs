#!/usr/bin/env node

const helper = require('think-helper');
const commander  = require('commander');
const directiveCollector = require('./directives/directiveCollector');
const tsDirective = require('./directives/tsDirective');
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');
const cwd = process.cwd();
const templatePath = path.join(__dirname, 'template');
const excludeFile = /^\./;
const configTreeFile = /.file$/;
const configTreeDir = /.dir$/
var excludeDir = [];
var projectRootPath = cwd; //project root path

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
  copyProject(templatePath, projectRootPath);
}


/**
 * privateFunc use in cli
 */
var privateFunc = {
  createConfig: function(currentSourcePath, targetSourcePath) {
     var configFilePath = path.resolve(cwd, 'think.json');

     fs.readFile(configFilePath, function(err, data) {
      if(err) {
        errlog(err);
        return;
      }

      try{
        var configTree = JSON.parse(data);
      }catch(e){
        errlog(e);
        return;
      }

      function handleConfig(currentSourcePath, targetSourcePath, config) {
        
        targetSourcePath = targetSourcePath.replace(configTreeDir, '');
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


commander.command('new <projectPath>')
         .description('create project')
         .option('-c --config', 'use config create project')
         .option('-t --ts','create project in typescript')
         .action((projectPath, option) => {
            projectRootPath = path.resolve(projectRootPath, projectPath);
            if(option.config === true) {
              privateFunc.handleConfig();
            }
            if(option.ts === true) {
              privateFunc.handleTsConfig();
            }
            createProject(projectPath);
        });

commander.command('create <mode> [name]')
         .description('create all kinds of modes in your project')
         .action((mode, name) => {
            directiveCollector(mode, name, projectRootPath, templatePath);
        });
commander.parse(process.argv);
