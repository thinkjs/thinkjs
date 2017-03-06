const helper = require('think-helper');
/**
 * interop require
 */
exports.interopRequire = function(obj, safe){
  if(helper.isString(obj)){
    if(safe){
      try{
        obj = require(obj);
      }catch(e){
        obj = null;
      }
    }else{
      obj = require(obj);
    }
  }
  return obj && obj.__esModule ? obj.default : obj;
}
