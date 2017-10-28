const util = require('../utils.js');

module.exports = function (maps) {
  return function(files, metalsmith, done) {
    const filter = util.compose(fileFilter, usefulKeys, isUseful)();
    files = filter(maps, files);
    done(null);
  }
};

function fileFilter(fn) {
  return (maps, files) =>  {
    return fn(maps, files)
      .reduce((result, key) => {
        result[key] = files[key]
        return result
      }, Object.create(null))
  }
}

function usefulKeys(fn) {
  return (maps, files) => {
    return Object
      .keys(files)
      .filter(filePath => fn(filePath, maps))
  }
}

function isUseful() {
  return (filePath, maps) => {
    return maps
      .some(mapping => new RegExp('^' + mapping[0]).test(filePath))
  }
}
