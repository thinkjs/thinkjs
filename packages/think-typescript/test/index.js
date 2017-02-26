/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-26 14:08:52
*/
import test from 'ava';
import helper from 'think-helper';
import thinkTypescript from '../index';
import path from 'path';
import fs from 'fs';
import ts from 'typescript';

test.serial.cb.beforeEach(t => {
  let outPath = path.join(__dirname, 'out');
  helper.rmdir(outPath, false).then(() => {
    t.end();
  });
});

test.serial('thinkTypescript-original', t => {
  let out = thinkTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts'
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js.map'));
  t.true(out && outFile && outMapFile);
});

test.serial('thinkTypescript-1', t => {
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
  t.true(out && outFile && !outMapFile);
});


test.serial('thinkTypescript-2', t => {
  let out = thinkTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts',
    ext: '.js2'
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js2'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js2.map'));
  t.true(out && outFile && outMapFile);
});


test.serial('thinkTypescript-3', t => {
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
  t.true(out);
});


let wrongSyntax = 'var a == (123;';
test.serial('thinkTypescript-4', t => {
  let testFilePath = path.join(__dirname, './src/a/b/test.ts');
  fs.appendFileSync(testFilePath, wrongSyntax);
  let out = thinkTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts'
  });

  var originData = fs.readFileSync(testFilePath, 'utf8').replace(wrongSyntax, '');
  fs.writeFileSync(testFilePath, originData);
  t.true(helper.isError(out));
});
