const helper = require('think-helper');
const path = require('path');
const fs = require('fs');

function loadFiles(dir){
  let files = helper.getdirFiles(dir).filter(file => {
    return /\.js$/.test(file);
  });
  let cache = {};
  files.forEach(file => {
    let name = file.replace(/\.js$/, '');
    cache[name] = require(path.join(dir, file));
  });
  return cache;
}

function loader(appPath, isMultiModule, type){
  if(isMultiModule){
    let dirs = fs.readdirSync(appPath);
    let cache = {};
    dirs.forEach(item => {
      let stat = fs.statSync(path.join(appPath, item));
      if(stat.isDirectory()){
        let itemCache = loadFiles(path.join(appPath, item, type));
        for(let name in itemCache){
          cache[path.join(item, name)] = itemCache[name];
        }
      }
    });
    return cache;
  }else{
    const dir = path.join(appPath, type);
    return loadFiles(dir);
  }
}

module.exports = loader;