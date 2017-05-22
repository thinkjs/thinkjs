const fs = require('fs');
const path = require('path');
const colors = require('colors');
const helper = require('think-helper');

module.exports = class Application {
  constructor(){
    this.projectPath = '';
    this.appPath = '';
  }
  checkProjectExist(){
    
  }
  getVersion(){
    let filepath = path.resolve(__dirname, './package.json');
    let version = JSON.parse(fs.readFileSync(filepath)).version;
    return version;
  }
  displayVersion(){
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
  createProject(projectPath){
    this.projectPath = projectPath;
    if(this.checkProjectExist()){
      console.log();
      console.log()
      return;
    }
    this.appPath = path.join(this.projectPath, 'src');
    
  }
}