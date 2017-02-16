const babelCore = require('babel-core')
const helper = require('think-helper')
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

function compileFileByTypescript(options) {
  let {srcPath, outPath, file, typescriptOptions, ext = '.js'} = options;
  let filePath = path.join(srcPath, file);
  let pPath = path.dirname(outPath + path.sep + file);
  let relativePath = path.relative(pPath, srcPath + path.sep + file);

  // typescript compile options
  typescriptOptions = Object.assign({
    fileName: file
  }, typescriptOptions);


  let data;
  let content = fs.readFileSync(filePath, 'utf8');
  try {
    data = ts.transpileModule(content, typescriptOptions);
  }
  catch(e) {
    throw new Error(e.message);
  }

  //has error
  if(data.diagnostics.length){
    let firstDiagnostics = data.diagnostics[0];
    let errMsg = `${firstDiagnostics.messageText}`;
    firstDiagnostics.file && (errMsg += `File: ${firstDiagnostics.file}`);
    firstDiagnostics.start && (errMsg += `Start: ${firstDiagnostics.start}`);
    throw new Error(errMsg);
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
