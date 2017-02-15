/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-15 18:45:50
*/

const compileFileByBabel = require('../index');
let out = compileFileByBabel('./test/src/a', './test/out', 'b/es6.es', '.js', {
  presets: [['es2015', {'loose': true}], 'stage-1'],
  plugins: ['transform-runtime'],
  sourceMaps: true
});
