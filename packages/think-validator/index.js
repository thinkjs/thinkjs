/*
* @Author: lushijie
* @Date:   2017-02-21 18:50:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-02 10:23:29
*/
const Validator = require('./rules.js');
const thinkHelper = require('think-helper');
const preDefinedErrors = require('./errors.js');

// the method names for required
const requiredRuleNames = [
  'required',
  'requiredIf',
  'requiredNotIf',
  'requiredWith',
  'requiredWithAll',
  'requiredWithOut',
  'requiredWithOutAll'
];

/**
 * get error message for rule
 * @param  {String} rule            [description]
 * @param  {String} pname        [description]
 * @param  {Array|Object|Number|String|Boolean} parsedRuleOptions [description]
 * @param  {String} errmsg          [description]
 * @return {String}                 [description]
 */
function _getErrorMessage(rname, pname, parsedRuleOptions, errmsg) {
  if(errmsg) {
    return errmsg;
  }

  let key = `validate_${rname}`;
  errmsg = preDefinedErrors[key] || 'PARAM_VALID_FAILED';

  if(thinkHelper.isArray(parsedRuleOptions)) {
    return errmsg.replace('{name}', pname)
      .replace('{args}', parsedRuleOptions.join(','));
  } else if(thinkHelper.isObject(parsedRuleOptions)) {
    return errmsg.replace('{name}', pname)
      .replace('{args}', JSON.stringify(parsedRuleOptions));
  }else {
    return errmsg.replace('{name}', pname)
      .replace('{args}', parsedRuleOptions);
  }
};

/**
 * parse the rule's arguments
 * @param  {String} rname        []
 * @param  {Array|Boolean|Object|String|Int} roptions []
 * @param  {Object} requestData []
 * @return {Array|Boolean|Object|String|Int}             []
 */
function _parseRuleOptions(rname, roptions, requestData) {
  let parseFn = Validator[`_${rname}`];
  if(thinkHelper.isFunction(parseFn)){
    roptions = parseFn(roptions, requestData);
  }
  return roptions;
};

/**
 * convert the param output style for int,float
 * @param  {Object} pitem [description]
 * @return {[type]}      [description]
 */
function _convertParamItemValue(pitem) {
  pitem = thinkHelper.extend({}, pitem);
  if(pitem.int) {
    return parseInt(pitem.value);
  }else if(pitem.float || pitem.numeric) {
    return parseFloat(pitem.value);
  }
  return pitem.value;
}

/**
 * check if the param's value is required
 * @param  {[type]}  pitem        [description]
 * @param  {Object}  requestData [description]
 * @return {Boolean}             [description]
 */
function _isValueRequired(pitem, requestData) {
  let isRequired = false;
  let vtype;
  for(var i = 0; i <= requiredRuleNames.length; i++) {
    vtype = requiredRuleNames[i];
    if(pitem[vtype]) {
      let fn = Validator[vtype];
      let afterParsedArgs = _parseRuleOptions(vtype, pitem[vtype], requestData);
      if(fn(pitem.value, afterParsedArgs)) {
        isRequired = true;
        break;
      };
    }
  }
  return isRequired;
}


let Validate = (name, callback) => {
  // register validate callback
  if (thinkHelper.isString(name)) {
    if (thinkHelper.isFunction(callback)) {
      Validator[name] = callback;
      return;
    }
    // get validator callback
    return Validator[name];
  }
  let pitems = name, requestData = callback;
  return Validate.exec(pitems, requestData);
};


/**
 * exec validate
 * @param  {Object} pitems []
 * @return {Object}            []
 */
Validate.exec = (pitems, requestData = {}) => {
  let ret = {};

  outerLoop:
  for(let pname in pitems){

    let pitem = pitems[pname];
    pitem.value = requestData[pname];

    // set default
    if(typeof(pitem.value) === 'undefined' && !thinkHelper.isTrueEmpty(pitem.default)){
      pitem.value = pitem.default;
    }

    // trim pitem value if trim is true
    if(pitem.trim && pitem.value && pitem.value.trim){
      pitem.value = pitem.value.trim();
    }

    // set defalut ret for response
    if(typeof pitem.value !== 'undefined') {
      ret[pname] = pitem.value;
    }

    let isRequired = _isValueRequired(pitem, requestData);
    if(isRequired && thinkHelper.isTrueEmpty(pitem.value)) {
      let rname = 'required';
      let parsedOptions = _parseRuleOptions(rname, pitem[rname], requestData);
      let errmsg = _getErrorMessage(rname, pname, parsedOptions, pitem.errmsg);
      ret = {
        _valid: false,
        name: pname,
        rule: rname,
        value: pitem.value,
        errmsg: errmsg
      }
      return ret;
    }else {
      if(thinkHelper.isTrueEmpty(pitem.value)) {
        continue outerLoop;
      }
    }

    for(let rname in pitem){
      // the skipedRule types for the item
      const skipedRuleNames = ['value', 'default', 'trim', 'errmsg'].concat(requiredRuleNames);

      // skip the attr don't need valid
      if(skipedRuleNames.indexOf(rname) >= 0) {
        continue;
      }

      // check if the valid method is exsit
      let fn = Validator[rname];
      if (!thinkHelper.isFunction(fn)) {
        return new Error(rname + ' valid method is not been configed');
      }

      // parse rule's options
      let parsedOptions = _parseRuleOptions(rname, pitem[rname], requestData);

      let result = fn(pitem.value, parsedOptions);
      if(!result){
        let errmsg = _getErrorMessage(rname, pname, parsedOptions, pitem.errmsg);
        ret = {
          _valid: false,
          name: pname,
          rule: rname,
          value: pitem.value,
          errmsg: errmsg
        }
        break outerLoop;
      }else {
        let convertValue = _convertParamItemValue(pitem);
        ret[pname] = convertValue;
      }
    } // end inner for

  } // end outer for
  return ret;
};


module.exports = Validate;
