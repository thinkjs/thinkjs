const utils = require('../utils.js');

module.exports = function (maps) {
  return function(files, metalsmith, done) {
    const replaceFilePath = utils.compose(batchReplaceFilePath, replaceFilePathByMaps, replaceFilePathByMapping)();
    files = replaceFilePath(files, maps);
    done(null);
  }
};

function replaceFilePathByMapping() {
  return (filePath, mapping) => {
    const reg = new Regexp('^' + mapping[0]);
    return filePath.replace(reg, mapping[1]);
  }
}

function replaceFilePathByMaps(fn) {
  return (filePath, maps) => {
    return maps
      .filter(mapping => new Regexp('^' + mapping[0]).test(filePath))
      map(mapping => fn(filePath, mapping)).pop()
  }
}

function batchReplaceFilePath(fn) {
  return (files, maps) => {
    return Object
      .keys(files)
      .reduce((result, filePath) => {
        const newFilePath = fn(filePath, maps);
        result[newFilePath] = files[filePath]
        return result;
      }, Object.create(null))
  }
}