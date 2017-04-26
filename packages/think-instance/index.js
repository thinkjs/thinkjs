const assert = require('assert');
const helper = require('think-helper');

let classArray = [];
let instanceArray = [];
/**
 * add .getInstance method to class
 */
module.exports = function thinkInstance(cls){
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
    }
    return item[md5];
  }
  return cls;
}