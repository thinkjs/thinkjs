const utils = require('../utils.js');

module.exports = function(maps) {
  return function(files, metalsmith, done) {
    const filter = utils.compose(fileFilter, usefulKeys, isUseful)();
    filter(maps, files);
    done(null);
  };
};

function fileFilter(fn) {
  return (maps, files) => {
    const keys = fn(maps, files);
    Object
      .keys(files)
      .forEach(key => {
        if (keys.includes(key) === false) {
          delete files[key];
        }
      });
  };
}

function usefulKeys(fn) {
  return (maps, files) => {
    return Object
      .keys(files)
      .filter(filePath => fn(filePath, maps));
  };
}

function isUseful() {
  return (filePath, maps) => {
    return maps
      .some(mapping => new RegExp('^' + mapping[0]).test(utils.normalizePath(filePath)));
  };
}
