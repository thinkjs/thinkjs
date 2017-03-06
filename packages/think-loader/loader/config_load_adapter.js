const helper = require('think-helper');
const path = require('path');
const interopRequire = require('./util.js').interopRequire;

/**
 * load apdater in application
 * src/adapter/session/file.js
 * src/adapter/session/db.js
 */
const loadAdapter = adapterPath => {
  let files = helper.getdirFiles(adapterPath);
  let ret = {};
  files.forEach(file => {
    let item = file.replace(/\.\w+$/, '').split(path.sep);
    if(!item[0] || !item[1]){
      return;
    }
    if(!ret[item[0]]){
      ret[item[0]] = {};
    }
    ret[item[0]][item[1]] = interopRequire(path.join(adapterPath, file));
  });
  return ret;
}

module.exports = loadAdapter;