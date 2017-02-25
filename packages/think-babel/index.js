const babelCore = require('babel-core');
const helper = require('think-helper');
const fs = require('fs');
const path = require('path');

/**
 * compile es6+ file to es5
 * @param  {Object} options
 * @return {Boolean}
 */
function babelTranspile(config){
  let {srcPath, outPath, file, options, ext = '.js'} = config;
  let filePath = path.join(srcPath, file);
  let pPath = path.dirname(path.join(outPath, file));
  let content = fs.readFileSync(filePath, 'utf8');
  let relativePath = path.relative(pPath, path.join(srcPath, file));

  // babel options
  options = Object.assign({
    filename: file,
    sourceFileName: relativePath,
    sourceMaps: true
  }, options);

  // babel transform
  let data;
  try {
    data = babelCore.transform(content, options);
  }catch(e) {
    return e;
  }

  // write es5 code file
  let outFile = path.join(outPath, file).replace(/\.\w+$/, ext);
  helper.mkdir(path.dirname(outFile));
  let basename = path.basename(file).replace(/\.\w+$/, ext);
  let prefix = '//# sourceMappingURL=';
  if(data.code.indexOf(prefix) === -1 && options.sourceMaps){
    data.code = data.code + '\n' + prefix + basename + '.map';
  }
  fs.writeFileSync(outFile, data.code);

  // write souremap file
  if(options.sourceMaps) {
    let sourceMap = data.map;
    sourceMap.file = sourceMap.sources[0];
    fs.writeFileSync(outFile + '.map', JSON.stringify(sourceMap, undefined, 4));
  }
  return true;
}

module.exports = babelTranspile;
