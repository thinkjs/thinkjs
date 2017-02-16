/*
* @Author: lushijie
* @Date:   2017-02-15 16:04:32
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-15 16:06:34
*/
const ts = require('typescript');
function compileByTypeScript(content, file){
  console.log(ts);
  // let ts = require('typescript');
  // let startTime = Date.now();
  // let diagnostics = [];
  // let output = ts.transpileModule(content, {
  //   compilerOptions: {
  //     module: ts.ModuleKind.CommonJS,
  //     target: ts.ScriptTarget.ES6,
  //     experimentalDecorators: true,
  //     emitDecoratorMetadata: true,
  //     allowSyntheticDefaultImports: true,
  //     sourceMap: true
  //   },
  //   fileName: file,
  //   reportDiagnostics: !!diagnostics
  // });
  // ts.addRange(diagnostics, output.diagnostics);

  // //has error
  // if(diagnostics.length){
  //   let firstDiagnostics = diagnostics[0];
  //   let {line, character} = firstDiagnostics.file.getLineAndCharacterOfPosition(firstDiagnostics.start);
  //   let message = ts.flattenDiagnosticMessageText(firstDiagnostics.messageText, '\n');
  //   throw new Error(`${message} on Line ${line + 1}, Character ${character}`);
  // }
  // if(this.options.log){
  //   think.log(`Compile file ${file}`, 'TypeScript', startTime);
  // }

  // file = this.replaceExtName(file, '.js');
  // let sourceMap = JSON.parse(output.sourceMapText);
  // sourceMap.sources[0] = this.getRelationPath(file);
  // sourceMap.sourcesContent = [content];
  // //file value must be equal sources values
  // sourceMap.file = sourceMap.sources[0];
  // delete sourceMap.sourceRoot;
  // this.compileByBabel(output.outputText, file, true, sourceMap);
}

compileByTypeScript()
