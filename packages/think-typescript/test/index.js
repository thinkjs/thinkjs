/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-16 20:28:59
*/
import test from 'ava'
import helper from 'think-helper'
import compileFileByTypescript from '../index'
import path from 'path'
import fs from 'fs'
import ts from 'typescript'

test.serial.cb.beforeEach(t => {
  let outPath = path.join(__dirname, 'out');
  helper.rmdir(outPath, false).then(() => {
    t.end();
  });
});

test.serial('compileFileByTypescript-1', t => {
  let out = compileFileByTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts',
    typescriptOptions: {
      compilerOptions:{
        module: 'commonjs',
        target: 'es5',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        allowSyntheticDefaultImports: true,
        sourceMap: true
      }
    },
    ext: '.js'
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js.map'));
  t.true(out && outFile && outMapFile);
});

test.serial('compileFileByTypescript-2', t => {
  let out = compileFileByTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts',
    typescriptOptions: {
      compilerOptions:{
        module: 'commonjs',
        target: 'es5',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        allowSyntheticDefaultImports: true,
        sourceMap: false
      }
    }
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js.map'));
  t.true(out && outFile && !outMapFile);
});


test.serial('compileFileByTypescript-3', t => {
  let out = compileFileByTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts',
    typescriptOptions: {
      compilerOptions:{
         module: 'commonjs',
         target: 'es5',
         experimentalDecorators: true,
         emitDecoratorMetadata: true,
         allowSyntheticDefaultImports: true,
         sourceMap: true
      }
    },
    ext: '.js2'
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js2'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js2.map'));
  t.true(out && outFile && outMapFile);
});


test.serial('compileFileByTypescript-4', t => {
  let out = compileFileByTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts',
    typescriptOptions: {
      compilerOptions:{
         module: 'commonjs',
         target: 'es5',
         experimentalDecorators: true,
         emitDecoratorMetadata: true,
         allowSyntheticDefaultImports: true,
         sourceMap: true
      }
    }
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js.map'));
  t.true(out && outFile && outMapFile);
});

test.serial('compileFileByTypescript-5', t => {
  let out = compileFileByTypescript({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.ts',
    typescriptOptions: {
      compilerOptions:{
         module: 'wrong',
         target: 'es5',
         experimentalDecorators: true,
         emitDecoratorMetadata: true,
         allowSyntheticDefaultImports: true,
         sourceMap: true
      }
    }
  });
  out = helper.isError(out);
  t.true(out);
});
