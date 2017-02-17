/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-17 10:39:04
*/
import test from 'ava'
import helper from 'think-helper'
import compileFileByBabel from '../index'
import path from 'path'
import fs from 'fs'

test.serial.cb.beforeEach(t => {
  let outPath = path.join(__dirname, 'out');
  helper.rmdir(outPath, false).then(() => {
    t.end();
  });
});

test.serial('compileFileByBabel-1', t => {
  let out = compileFileByBabel({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.es',
    babelOptions: {
      presets: ['es2015'],
      sourceMaps: true
    },
    ext: '.js',
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js.map'));
  t.true(out && outFile && outMapFile);
});

test.serial('compileFileByBabel-2', t => {
  let out = compileFileByBabel({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.es',
    babelOptions: {
      presets: ['es2015'],
      sourceMaps: true
    }
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js.map'));
  t.true(out && outFile && outMapFile);
});

test.serial('compileFileByBabel-3', t => {
  let out = compileFileByBabel({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.es',
    babelOptions: {
      presets: ['es2015'],
      sourceMaps: false
    }
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js.map'));
  t.true(out && outFile && !outMapFile);
});

let wrongSyntax = 'wrong syntax';
test.serial('compileFileByBabel-4', t => {
  let testFilePath = path.join(__dirname, './src/a/b/test.es');
  fs.appendFileSync(testFilePath, wrongSyntax);
  let out = compileFileByBabel({
    srcPath: './test/src/a',
    outPath: './test/out',
    file: 'b/test.es',
    babelOptions: {
      presets: ['es2015'],
      sourceMaps: false
    }
  });

  var originData = fs.readFileSync(testFilePath, 'utf8').replace(new RegExp(wrongSyntax), '');
  fs.writeFileSync(testFilePath, originData);

  t.true(helper.isError(out));
});
