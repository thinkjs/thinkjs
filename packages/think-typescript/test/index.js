/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-26 14:08:52
*/
const {test, beforeEach} = require('node:test');
const helper = require('think-helper');
const thinkTypescript = require('../index');
const path = require('path');
const fs = require('fs');
const ts = require('typescript');

beforeEach(() => {
  let outPath = path.join(__dirname, 'out');
  return helper.rmdir(outPath, false);
});

test('thinkTypescript-original', t => {
  let out = thinkTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts'
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js.map'));
  t.assert.strictEqual(out && outFile && outMapFile, true);
});

test('thinkTypescript-1', t => {
  let out = thinkTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts',
    options: {
      compilerOptions:{
        sourceMap: false
      }
    }
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js.map'));
  t.assert.strictEqual(out && outFile && !outMapFile, true);
});


test('thinkTypescript-2', t => {
  let out = thinkTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts',
    ext: '.js2'
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js2'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js2.map'));
  t.assert.strictEqual(out && outFile && outMapFile, true);
});


test('thinkTypescript-3', t => {
  let out = thinkTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts',
    options: {
      compilerOptions:{
         module: 'wrong config'
      }
    }
  });
  out = helper.isError(out);
  t.assert.strictEqual(out, true);
});


let wrongSyntax = 'var a == (123;';
test('thinkTypescript-4', t => {
  let testFilePath = path.join(__dirname, './src/a/b/test.ts');
  fs.appendFileSync(testFilePath, wrongSyntax);
  let out = thinkTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts'
  });

  var originData = fs.readFileSync(testFilePath, 'utf8').replace(wrongSyntax, '');
  fs.writeFileSync(testFilePath, originData);
  t.assert.strictEqual(helper.isError(out), true);
});

test('reports exactly the JS/map files after a successful emit', t => {
  const reports = [];
  const config = {srcPath: './test/src/a', outPath: './test/out', file: 'b/test.ts', onEmit: files => {
    files.forEach(file => t.assert.strictEqual(fs.existsSync(path.join('test/out', file)), true));
    reports.push(files);
  }};
  t.assert.strictEqual(thinkTypescript(config), true);
  t.assert.deepStrictEqual(reports, [['b/test.js', 'b/test.js.map']]);
  reports.length = 0;
  config.options = {compilerOptions: {sourceMap: false}};
  thinkTypescript(config);
  t.assert.deepStrictEqual(reports, [['b/test.js']]);
  reports.length = 0;
  config.options = {compilerOptions: {module: 'wrong config'}};
  t.assert.strictEqual(thinkTypescript(config) instanceof Error, true);
  t.assert.deepStrictEqual(reports, []);
});
