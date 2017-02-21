const helper = require('think-helper');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const lineColumn = require('line-column');

function thinkTypescript(options) {
  let {srcPath, outPath, file, typescriptOptions, ext = '.js'} = options;
  let filePath = path.join(srcPath, file);
  let pPath = path.dirname(path.join(outPath, file));
  let relativePath = path.relative(pPath, path.join(srcPath, file));

  // typescript compile options
  typescriptOptions = Object.assign({
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      module: 'commonjs',
      target: 'es5',
      sourceMap: true
    }
  }, typescriptOptions);

  let content = fs.readFileSync(filePath, 'utf8');
  let data = ts.transpileModule(content, typescriptOptions);

  // error handle
  if(data.diagnostics && data.diagnostics.length){
    let firstDiagnostics = data.diagnostics[0];
    if(firstDiagnostics.file && firstDiagnostics.start) {
      let errPos = lineColumn(firstDiagnostics.file.text, firstDiagnostics.start);
      return new Error(`${firstDiagnostics.messageText} File: ${path.join(srcPath, firstDiagnostics.file.path)} Line: ${errPos.line} Column: ${errPos.col}`);
    }else {
      return new Error(`${firstDiagnostics.messageText}`);
    }
  }

  // write js file
  let outFile = path.join(outPath, file).replace(/\.\w+$/, ext);
  helper.mkdir(path.dirname(outFile));
  fs.writeFileSync(outFile, data.outputText);

  // write map file
  if(typescriptOptions && typescriptOptions.compilerOptions && typescriptOptions.compilerOptions.sourceMap) {
    let sourceMap = JSON.parse(data.sourceMapText);
    sourceMap.file = sourceMap.sources[0] = relativePath;
    fs.writeFileSync(outFile + '.map', JSON.stringify(sourceMap, undefined, 4));
  }
  return true;
}

module.exports = thinkTypescript;
