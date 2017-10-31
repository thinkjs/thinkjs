const utils = require('../utils.js');

module.exports = function() {
  return function(files, metalsmith, done) {
    const metadata = metalsmith.metadata();
    const normalize = utils.compose(batchReplacePath, replaceType, replaceAction, replaceModule)();
    normalize(files, metadata);
    done(null);
  };
};

function batchReplacePath(fn) {
  return (files, ctx) => {
    Object
      .keys(files)
      .forEach(filePath => {
        const newPath = fn(filePath, ctx);
        if (newPath !== filePath) {
          files[newPath] = files[filePath];
          delete files[filePath]
        }
      })
  }
}

function replaceType(fn) {
  return (path, ctx) => fn(path, ctx).replace(/(\[type\])/g, type => (ctx[type.substring(1, type.length - 1)] || ''));
}

function replaceAction(fn) {
  return (path, ctx) => fn(path, ctx).replace(/(\[action\])/g, action => (ctx[action.substring(1, action.length - 1)] || ''));
}

function replaceModule() {
  return (path, ctx) => path.replace(/(\[module\])/g, module => (ctx[module.substring(1, module.length - 1)] || ''));
}
