const babel = require('babel-core');
// const helper = require('think-helper');
const fs = require('fs');
const path = require('path');
const {SourceMapGenerator, SourceMapConsumer} = require('source-map');
const helper = {
  isFile: function(p) {
    try{
      return fs.statSync(p).isFile();
    }catch(e){}
    return false;
  },
  mkdir: function(p, mode) {
    mode = mode || '0777';
    if (fs.existsSync(p)) {
      chmod(p, mode);
      return true;
    }
    let pp = path.dirname(p);
    if (fs.existsSync(pp)) {
      fs.mkdirSync(p, mode);
    }else{
      mkdir(pp, mode);
      mkdir(p, mode);
    }
    return true;
  },
  isString: function(obj) {
    return toString.call(obj) === '[object String]';
  },
  getFiles: function(dir, prefix, filter) {
    dir = path.normalize(dir);

    if (!fs.existsSync(dir)) {
      console.log('dd', dir);
      return [];
    }
    if(!helper.isString(prefix)){
      filter = prefix;
      prefix = '';
    }
    if(filter === true){
      filter = item => {
        return item[0] !== '.';
      };
    }
    prefix = prefix || '';
    let files = fs.readdirSync(dir);
    let result = [];
    files.forEach(item => {
      let stat = fs.statSync(dir + path.sep + item);
      if (stat.isFile()) {
        if(!filter || filter(item)){
          result.push(prefix + item);
        }
      }else if(stat.isDirectory()){
        if(!filter || filter(item, true)){
          let cFiles = getFiles(dir + sep + item, prefix + item + sep, filter);
          result = result.concat(cFiles);
        }
      }
    });
    return result;
  }
}

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
    //think.log(`Compile file ${file}`, 'Babel', startTime);
    console.log(`Compile file ${file}`, 'Babel', startTime);
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
function babelCompile(srcPath, outPath, options) {
  let compiledMtime = {};
  let compiledErrorFiles = [];
  let changedFiles = [];
  srcPath = path.normalize(srcPath);
  outPath = path.normalize(outPath);
  let files = helper.getFiles(srcPath, true);

  files.forEach(file => {
    let filePath = `${srcPath}${path.sep}${file}`;
    let content = fs.readFileSync(filePath, 'utf8');
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
        // think.log(colors => {
        //   return colors.red(`compile file ${file} error`);
        // }, 'COMPILE');
        // think.log(e);
        console.log(colors => {
          return colors.red(`compile file ${file} error`);
        }, 'BABELCOMPILE');
        console.log(e);
        e.message = 'Compile Error: ' + e.message;
        if(index === -1){
          compiledErrorFiles.push(file);
        }
      }
    }
  })
}

module.exports = {
  babelCompile: babelCompile
}
