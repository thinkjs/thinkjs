'use strict';

var thinkit = require('thinkit');
for(var name in thinkit){
  global[name] = thinkit[name];
}
/**
 * 获取对象的值
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
Object.values = function(obj){
  var values = [];
  for(var key in obj){
    if (obj.hasOwnProperty(key)) {
      values.push(obj[key])
    }
  }
  return values;
};
