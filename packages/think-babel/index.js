const babelCore = require('babel-core');
const helper = require('think-helper');
const fs = require('fs');
const path = require('path');

/**
 * compile es6+ file to es5
 * @param  {Object} options
 * @return {Boolean}
 */
function babelTranspile(config) {
  const {srcPath, outPath, file, ext = '.js'} = config;
  let {options} = config;
  const filePath = path.join(srcPath, file);
  const pPath = path.dirname(path.join(outPath, file));
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(pPath, path.join(srcPath, file));

  // babel options
  options = Object.assign({
    filename: file,
    sourceFileName: relativePath,
    sourceMaps: true,
    babelrc: false
  }, options);

  // babel transform
  let data;
  try {
    data = babelCore.transform(content, options);
  } catch (e) {
    return e;
  }

  // write es5 code file
  const outFile = path.join(outPath, file).replace(/\.\w+$/, ext);
  helper.mkdir(path.dirname(outFile));
  const basename = path.basename(file).replace(/\.\w+$/, ext);
  const prefix = '//# sourceMappingURL=';
  if (data.code.indexOf(prefix) === -1 && options.sourceMaps) {
    data.code = data.code + '\n' + prefix + basename + '.map';
  }
  fs.writeFileSync(outFile, data.code);

  // write souremap file
  if (options.sourceMaps) {
    const sourceMap = data.map;
    sourceMap.file = sourceMap.sources[0];
    fs.writeFileSync(outFile + '.map', JSON.stringify(sourceMap, undefined, 4));
  }
  return true;
}

module.exports = babelTranspile;
