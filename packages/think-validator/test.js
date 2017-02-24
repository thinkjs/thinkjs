/*
* @Author: lushijie
* @Date:   2017-02-24 16:28:44
* @Last Modified by:   lushijie
* @Last Modified time: 2017-02-24 17:13:02
*/

function _isOriginValue(type) {
  let vtypeNeedParse = ['array', 'object', 'string', 'boolean'];
  let index = vtypeNeedParse.indexOf(type);
  if(index >= 0) {
    return vtypeNeedParse[index];
  }else {
    return false;
  }
}

console.log(_isOriginValue('object1'))
