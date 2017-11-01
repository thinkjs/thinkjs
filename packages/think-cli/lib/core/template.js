const render = require('consolidate').ejs.render;
const multimatch = require('multimatch');
const logger = require('../logger.js');
const utils = require('../utils.js');
const path = require('path');

module.exports = function(source, skipCompile) {
  skipCompile = typeof skipCompile === 'string'
    ? [skipCompile]
    : skipCompile;

  return function(files, metalsmith, done) {
    const metadata = metalsmith.metadata();
    const run = utils.compose(startCompileFiles, compileFiles, skipOrCompile, setFileContent, compile)(source, metadata, render);

    run(skipCompile, multimatch, files, logger).then(_ => {
      done(null);
    }, done);
  };
};

function startCompileFiles(fn) {
  return (...args) => Promise.all(fn(...args));
}

function compileFiles(fn) {
  return (skipCompile, multimatch, files, logger) => {
    return Object
      .keys(files)
      .map(file => {
        return fn(skipCompile, multimatch, files, file).catch(err => {
          logger.error('"%s" file render failed. Please add the file to the skipCompile key in the metadata.js', file);
        });
      });
  };
}

function skipOrCompile(fn) {
  return (skipCompile, multimatch, files, file) => {
    const str = files[file].contents.toString();
    return skipCompile && multimatch([file], skipCompile, { dot: true }).length
      ? Promise.resolve()
      : fn(str, files[file], file);
  };
}

function setFileContent(fn) {
  return (str, file, filePath) => {
    return fn(str, filePath)
      .then(res => {
        file.contents = Buffer.from(res);
      });
  };
}

function compile(source, metadata, render) {
  return (str, filePath) => render(str, Object.assign(metadata, {
    filename: path.join(source, 'template', filePath)
  }));
}
