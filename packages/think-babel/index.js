const babelCore = require('babel-core')
const helper = require('think-helper')
const fs = require('fs')
const path = require('path')

/**
 * compile es6+ file to es5
 * @param  {Object} options
 * @return {Boolean}
 */
function compileFileByBabel(options = {}){
  let {srcPath, outPath, file, babelOptions, ext = '.js'} = options;
  srcPath = path.normalize(srcPath);
  outPath = path.normalize(outPath);
  let filePath = path.join(srcPath, file);
  let pPath = path.dirname(outPath + path.sep + file);
  let content = fs.readFileSync(filePath, 'utf8');
  let relativePath = path.relative(pPath, srcPath + path.sep + file);

  // babel options
  babelOptions = Object.assign({
    filename: file,
    sourceFileName: relativePath
  }, babelOptions);

  // babel transform
  let data;
  try {
    data = babelCore.transform(content, babelOptions);
  }
  catch(e) {
    throw new Error(e.message);
  }

  // write es5 code file
  let outFile = path.join(outPath, file);
  outFile = outFile.replace(/\.\w+$/, ext);
  helper.mkdir(path.dirname(outFile));
  let basename = path.basename(file).replace(/\.\w+$/, ext);
  let prefix = '//# sourceMappingURL=';
  if(data.code.indexOf(prefix) === -1 && babelOptions.sourceMaps){
    data.code = data.code + '\n' + prefix + basename + '.map';
  }
  fs.writeFileSync(outFile, data.code);

  // write souremap file
  if(babelOptions.sourceMaps) {
    let sourceMap = data.map;
    sourceMap.file = sourceMap.sources[0];
    fs.writeFileSync(outFile + '.map', JSON.stringify(sourceMap, undefined, 4));
  }
  return true;
}

module.exports = compileFileByBabel;
