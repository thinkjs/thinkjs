const babel = require('babel-core');
const helper = require('think-helper');
const fs = require('fs');
const path = require('path');

/**
 * get relative path
 * @param  {String} file []
 * @return {String}      []
 */
function getRelationPath(srcPath, outPath, file) {
  //use dirname to resolve file path in source-map-support
  //so must use dirname in here
  let pPath = path.dirname(outPath + path.sep + file);
  return path.relative(pPath, srcPath + path.sep + file);
}

/**
 * replace filepath extname
 * @param  {String} filepath []
 * @param  {String} extname  []
 * @return {String}          []
 */
function replaceExtName(filepath, extname = '') {
  return filepath.replace(/\.\w+$/, extname);
}

/**
 * compile es6+ file to es5
 * @param  {String} srcPath file src path
 * @param  {String} outPath file out path
 * @param  {[type]} file    file path without src
 * @param  {String} newExt  the new file ext,eg: '.js'
 * @param  {Object} options babel options
 * @return {Boolean}
 */
function compileFileByBabel(srcPath, outPath, file, newExt, options = {}){
  try {
    if(helper.isObject(newExt)) {
      options = newExt;
      newExt = '.js';
    }

    srcPath = path.normalize(srcPath);
    outPath = path.normalize(outPath);
    let filePath = `${srcPath}${path.sep}${file}`;
    let content = fs.readFileSync(filePath, 'utf8');
    let relativePath = getRelationPath(srcPath, outPath, file);
    options = Object.assign({
      filename: file,
      sourceFileName: relativePath
    }, options);

    let data = babel.transform(content, options);
    let outFile = `${outPath}${path.sep}${file}`;
    outFile = replaceExtName(outFile, newExt);
    helper.mkdir(path.dirname(outFile));

    let basename = path.basename(file);
    let prefix = '//# sourceMappingURL=';
    if(data.code.indexOf(prefix) === -1 && options.sourceMaps){
      data.code = data.code + '\n' + prefix + basename + '.map';
    }
    fs.writeFileSync(outFile, data.code);

    if(options.sourceMaps) {
      let sourceMap = data.map;
      sourceMap.file = sourceMap.sources[0];
      fs.writeFileSync(`${outFile}.map`, JSON.stringify(sourceMap, undefined, 4));
    }
    return true;
  }
  catch(e) {
    throw new Error(e.message);
  }
}

module.exports = compileFileByBabel;
