const babelCore = require('babel-core')
const helper = require('think-helper')
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

/**
 * compile es6+ file to es5
 * @param  {Object} options
 * @return {Boolean}
 */
// function compileFileByTypescript(options = {}){
//   let {srcPath, outPath, file, ext = '.js', babelOptions} = options;
//   srcPath = path.normalize(srcPath);
//   outPath = path.normalize(outPath);
//   let filePath = path.join(srcPath, file);
//   let pPath = path.dirname(outPath + path.sep + file);
//   let content = fs.readFileSync(filePath, 'utf8');
//   let relativePath = path.relative(pPath, srcPath + path.sep + file);

//   // babel options
//   babelOptions = Object.assign({
//     filename: file,
//     sourceFileName: relativePath
//   }, babelOptions);

//   // babel transform
//   let data;
//   try {
//     data = babelCore.transform(content, babelOptions);
//   }
//   catch(e) {
//     throw new Error(e.message);
//   }

//   // write es5 code file
//   let outFile = path.join(outPath, file);
//   outFile = outFile.replace(/\.\w+$/, ext);
//   helper.mkdir(path.dirname(outFile));
//   let basename = path.basename(file);
//   let prefix = '//# sourceMappingURL=';
//   if(data.code.indexOf(prefix) === -1 && babelOptions.sourceMaps){
//     data.code = data.code + '\n' + prefix + basename + '.map';
//   }
//   fs.writeFileSync(outFile, data.code);

//   // write souremap file
//   if(babelOptions.sourceMaps) {
//     let sourceMap = data.map;
//     sourceMap.file = sourceMap.sources[0];
//     fs.writeFileSync(outFile + '.map', JSON.stringify(sourceMap, undefined, 4));
//   }
//   return true;
// }

function compileFileByTypescript(options) {
  let {srcPath, outPath, file, typescriptOptions, ext = '.js'} = options;
  typescriptOptions.fileName = file;
  let filePath = path.join(srcPath, file);
  let content = fs.readFileSync(filePath, 'utf8');

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
    sourceMap.file = sourceMap.sources[0];
    fs.writeFileSync(outFile + '.map', JSON.stringify(sourceMap, undefined, 4));
  }
}

compileFileByTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts',
    typescriptOptions: {
      compilerOptions:{
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES6,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        allowSyntheticDefaultImports: true,
        sourceMap: true
      }
    },
    ext: '.js'
})

module.exports = compileFileByTypescript;
