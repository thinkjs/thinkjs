const helper = require('think-helper');
const path = require('path');

function loadFiles(dir){
  let files = helper.getdirFiles(dir).filter(file => {
    return /\.js$/.test(file);
  });
  let cache = files.map(file => {
    let name = file.replace(/\\/g, '/').replace(/\.js$/, '');
    return {name, export: require(path.join(dir, file))}
  }).sort((a, b) => {
    let al = a.name.split('/').length;
    let bl = b.name.split('/').length;
    if(al === bl){
      return a.name < b.name ? 1 : -1;
    }
    return al < bl ? 1 : -1;
  });
  let ret = {};
  for(let name in cache){
    ret[cache[name].name] = cache[name].export;
  }
  return ret;
}

function loader(appPath, type, modules){
  if(modules.length){
    let cache = {};
    modules.forEach(item => {
      let itemCache = loadFiles(path.join(appPath, item, type));
      for(let name in itemCache){
        cache[path.join(item, name)] = itemCache[name];
      }
    });
    return cache;
  }else{
    const dir = path.join(appPath, type);
    return loadFiles(dir);
  }
}

module.exports = loader;