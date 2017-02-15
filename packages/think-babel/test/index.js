/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-15 15:39:28
*/

var babelCompile = require('../index').babelCompile;
babelCompile('./test/src', './test/out', {shouldLog: true})
