const helper = require('think-helper');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const lineColumn = require('line-column');

function typescriptTranspile(config) {
  const {srcPath, outPath, file, ext = '.js'} = config;
  let {options} = config;
  const filePath = path.join(srcPath, file);
  const pPath = path.dirname(path.join(outPath, file));
  const relativePath = path.relative(pPath, path.join(srcPath, file));

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

  const content = fs.readFileSync(filePath, 'utf8');
  const data = ts.transpileModule(content, options);

  // error handle
  if (data.diagnostics && data.diagnostics.length) {
    const firstDiagnostics = data.diagnostics[0];
    if (firstDiagnostics.file && firstDiagnostics.start) {
      const errPos = lineColumn(firstDiagnostics.file.text, firstDiagnostics.start);
      return new Error(`${firstDiagnostics.messageText} File: ${path.join(srcPath, firstDiagnostics.file.path)} Line: ${errPos.line} Column: ${errPos.col}`);
    } else {
      return new Error(`${firstDiagnostics.messageText}`);
    }
  }

  // write js file
  const outFile = path.join(outPath, file).replace(/\.\w+$/, ext);
  helper.mkdir(path.dirname(outFile));
  fs.writeFileSync(outFile, data.outputText);

  // write map file
  if (options && options.compilerOptions && options.compilerOptions.sourceMap) {
    const sourceMap = JSON.parse(data.sourceMapText);
    sourceMap.file = sourceMap.sources[0] = relativePath;
    fs.writeFileSync(outFile + '.map', JSON.stringify(sourceMap, undefined, 4));
  }
  return true;
}

module.exports = typescriptTranspile;
