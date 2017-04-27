const assert = require('assert');
const helper = require('think-helper');

let classArray = [];
let instanceArray = [];
/**
 * add .getInstance method to class
 */
module.exports = function thinkInstance(cls, maxLength = 10, beforeDeleteMethod = 'close'){
  assert(helper.isFunction(cls), 'cls must be a function');

  if(cls.getInstance) return cls;

  let index = classArray.indexOf(cls);
  if(index === -1){
    classArray.push(cls);
    index = classArray.length - 1;
  }
  if(!instanceArray[index]){
    instanceArray[index] = {};
  }
  const item = instanceArray[index];

  //add .getInstance method to cls
  cls.getInstance = function getInstance(...config){
    const md5 = helper.md5(JSON.stringify(config));
    if(!item[md5]){
      item[md5] = new cls(...config);
      if(Object.keys(item).length > maxLength){
        for(let key in item){
          let instance = item[key];
          if(instance[beforeDeleteMethod]){
            instance[beforeDeleteMethod]();
          }
          delete item[key];
          break;
        }
      }
    }
    return item[md5];
  }
  return cls;
}