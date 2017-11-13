const utils = require('../utils.js');

module.exports = function(maps) {
  return function(files, metalsmith, done) {
    const replaceFilePath = utils.compose(batchReplaceFilePath, replaceFilePathByMaps, replaceFilePathByMapping)();
    replaceFilePath(files, maps);
    done(null);
  };
};

function replaceFilePathByMapping() {
  return (filePath, mapping) => {
    const reg = new RegExp('^' + mapping[0]);
    return filePath.replace(reg, mapping[1]);
  };
}

function replaceFilePathByMaps(fn) {
  return (filePath, maps) => {
    const newMaps = maps.filter(mapping => new RegExp('^' + mapping[0]).test(utils.normalizePath(filePath)));
    return fn(filePath, newMaps[0]);
  };
}

function batchReplaceFilePath(fn) {
  return (files, maps) => {
    return Object
      .keys(files)
      .forEach(filePath => {
        const newFilePath = fn(filePath, maps);
        files[newFilePath] = files[filePath];
        newFilePath !== filePath && delete files[filePath];
      });
  };
}
