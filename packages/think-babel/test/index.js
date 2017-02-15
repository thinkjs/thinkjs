/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-15 19:07:25
*/
import test from 'ava'
import helper from 'think-helper'
import compileFileByBabel from '../index'
import path from 'path'
import fs from 'fs'

test.before(t => {
  console.log('  Remove test output directory');
  let outPath = path.join(__dirname, 'out');
  helper.rmdir(outPath, false);
});

test('compileFileByBabel', t => {
  let out = compileFileByBabel('./test/src/a', './test/out', 'b/test.es', '.js', {
    presets: [['es2015', {'loose': true}], 'stage-1'],
    plugins: ['transform-runtime'],
    sourceMaps: true
  });
  let outFile = helper.isFile(path.join(__dirname, 'out/b/test.js'));
  let outMapFile = helper.isFile(path.join(__dirname, 'out/b/test.js.map'))
  t.true(out && outFile && outMapFile);
});
