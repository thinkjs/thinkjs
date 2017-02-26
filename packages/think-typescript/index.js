const helper = require('think-helper');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const lineColumn = require('line-column');

function typescriptTranspile(config) {
  let {srcPath, outPath, file, options, ext = '.js'} = config;
  let filePath = path.join(srcPath, file);
  let pPath = path.dirname(path.join(outPath, file));
  let relativePath = path.relative(pPath, path.join(srcPath, file));

  // typescript compile options
  options = Object.assign({
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      module: 'commonjs',
      target: 'es5',
      sourceMap: true
    }
  }, options);

  let content = fs.readFileSync(filePath, 'utf8');
  let data = ts.transpileModule(content, options);

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
  if(options && options.compilerOptions && options.compilerOptions.sourceMap) {
    let sourceMap = JSON.parse(data.sourceMapText);
    sourceMap.file = sourceMap.sources[0] = relativePath;
    fs.writeFileSync(outFile + '.map', JSON.stringify(sourceMap, undefined, 4));
  }
  return true;
}

module.exports = typescriptTranspile;
