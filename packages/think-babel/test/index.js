/*
* @Author: lushijie
* @Date:   2017-02-14 10:56:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-15 14:55:21
*/
// import test from 'ava';
import {babelCompile} from '../index';

//console.log(babelCompile);

babelCompile('./test/src', './test/out', {shouldLog: true})
