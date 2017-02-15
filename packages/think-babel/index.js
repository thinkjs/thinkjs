const babel = require('babel-core');
const helper = require('think-helper');
const fs = require('fs');
const path = require('path');
const {SourceMapGenerator, SourceMapConsumer} = require('source-map');

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
 * merge source map
 * @param  {String} content        []
 * @param  {Object} orginSourceMap []
 * @param  {Object} sourceMap      []
 * @return {}                []
 */
function mergeSourceMap(orginSourceMap, sourceMap) {
  sourceMap.file = sourceMap.file.replace(/\\/g, '/');
  sourceMap.sources = sourceMap.sources.map(filePath => {
    return filePath.replace(/\\/g, '/');
  });
  var generator = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(sourceMap));
  generator.applySourceMap(new SourceMapConsumer(orginSourceMap));
  sourceMap = JSON.parse(generator.toString());
  return sourceMap;
}

function compileByBabel(srcPath, outPath, content, file, options = {}){
  let startTime = Date.now();
  let {
        presets,
        plugins,
        alreadyLogged,
        shouldLog,
        orginSourceMap
      } = options;
  let relativePath = getRelationPath(srcPath, outPath, file);
  let data = babel.transform(content, {
    filename: file,
    presets: [].concat(presets || [['es2015', {'loose': true}], 'stage-1']),
    plugins: [].concat(plugins || ['transform-runtime']),
    sourceMaps: true,
    sourceFileName: relativePath
  });

  if(!alreadyLogged && shouldLog){
    think.log(`Compile file ${file}`, 'Babel', startTime);
  }
  helper.mkdir(path.dirname(`${outPath}${path.sep}${file}`));

  let basename = path.basename(file);
  let prefix = '//# sourceMappingURL=';
  if(data.code.indexOf(prefix) === -1){
    data.code = data.code + '\n' + prefix + basename + '.map';
  }
  fs.writeFileSync(`${outPath}${path.sep}${file}`, data.code);
  let sourceMap = data.map;
  sourceMap.file = sourceMap.sources[0];
  if(orginSourceMap){
    sourceMap = mergeSourceMap(orginSourceMap, sourceMap);
  }
  fs.writeFileSync(`${outPath}${path.sep}${file}.map`, JSON.stringify(sourceMap, undefined, 4));
}

/**
 * compile es6+ file to es5 by Babel
 * @param  {[type]} srcPath []
 * @param  {[type]} outPath []
 * @param  {[type]} options []
 * @return {}               []
 */
function compileFile(srcPath, outPath, options) {
  let compiledMtime = {};
  let compiledErrorFiles = [];
  srcPath = path.normalize(srcPath);
  outPath = path.normalize(outPath);
  let files = helper.getFiles(srcPath, true);

  files.forEach(file => {
    let extname = path.extname(file);
    let mTime = fs.statSync(`${srcPath}${path.sep}${file}`).mtime.getTime();
    let outFile = `${outPath}${path.sep}${file}`;

    if(helper.isFile(outFile)){
      let outmTime = fs.statSync(outFile).mtime.getTime();
      if(outmTime >= mTime){
        return;
      }
    }
    if(!compiledMtime[file] || mTime > compiledMtime[file]){
      let index = compiledErrorFiles.indexOf(file);
      try{
        compileByBabel(srcPath, outPath, content, file, options);
        if(index > -1){
          compiledErrorFiles.splice(index, 1);
        }
        changedFiles.push(outFile);
        compiledMtime[file] = mTime;
      }catch(e){
        think.log(colors => {
          return colors.red(`compile file ${file} error`);
        }, 'COMPILE');
        think.log(e);
        e.message = 'Compile Error: ' + e.message;
        if(index === -1){
          compiledErrorFiles.push(file);
        }
      }
    }
  });
}

module.exports = {
  compileFile: compileFile
}
