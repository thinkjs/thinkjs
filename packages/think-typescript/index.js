const babelCore = require('babel-core')
const helper = require('think-helper')
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

function compileFileByTypescript(options) {
  let {srcPath, outPath, file, typescriptOptions, ext = '.js'} = options;
  typescriptOptions.fileName = file;
  let filePath = path.join(srcPath, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let pPath = path.dirname(outPath + path.sep + file);
  let relativePath = path.relative(pPath, srcPath + path.sep + file);

  let data;
  try {
    data = ts.transpileModule(content, typescriptOptions);
  }
  catch(e) {
    throw new Error(e.message);
  }

  // write js file
  let outFile = path.join(outPath, file);
  outFile = outFile.replace(/\.\w+$/, ext);
  helper.mkdir(path.dirname(outFile));
  fs.writeFileSync(outFile, data.outputText);

  // write map file
  if(typescriptOptions.compilerOptions.sourceMap) {
    let sourceMap = JSON.parse(data.sourceMapText);
    sourceMap.file = sourceMap.sources[0] = relativePath;
    fs.writeFileSync(outFile + '.map', JSON.stringify(sourceMap, undefined, 4));
  }
  return true;
}

module.exports = compileFileByTypescript;
