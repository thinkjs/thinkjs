//该文件内容为原生对象的扩展

/**
 * 获取对象的值
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
Object.values = function(obj){
  'use strict';
  var values = [];
  for(var key in obj){
    if (obj.hasOwnProperty(key)) {
      values.push(obj[key])
    }
  }
  return values;
};
