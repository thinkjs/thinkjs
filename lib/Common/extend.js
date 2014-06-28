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
/**
 * 数组求和
 * @return {[type]} [description]
 */
Array.prototype.sum = function(){
  'use strict';
  var count = 0;
  this.forEach(function(item){
    count += item;
  });
  return count;
};
