/*
* @Author: lushijie
* @Date:   2017-12-20 10:54:47
* @Last Modified by:   lushijie
* @Last Modified time: 2017-12-20 10:56:17
*/
const test = require('ava');
const index = require('../index.js');
const helper = require('think-helper');

test('index is a function', t => {
  t.is(helper.isFunction(index), true);
})
