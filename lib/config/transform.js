'use strict';

/**
 * get function
 * @param  {mixed} value  []
 * @param  {String} config []
 * @return {}        []
 */
function getFn(value, config){
  if (!value || think.isFunction(value)) {
    return value;
  }
  value = global[value];
  if (think.isFunction(value)) {
    return value;
  }
  var msg = think.message('CONFIG_NOT_FUNCTION', config);
  throw new Error(msg);
}

module.exports = {
  post: {
    json_content_type: function(value){
      if (think.isString(value)) {
        return [value];
      }
      if (!think.isArray(value)) {
        var msg = think.message('CONFIG_NOT_VALID', 'post.json_content_type');
        throw new Error(msg);
      }
      return value;
    }
  },
  subdomain: function(value){
    if (think.isString(value)) {
      return think.getObject(value, value);
    }
    if (think.isArray(value)) {
      var obj = {};
      value.forEach(function(item){
        obj[item] = item;
      })
      return obj;
    }
    if (!think.isObject(value)) {
      var msg = think.message('CONFIG_NOT_VALID', 'subdomain');
      throw new Error(msg);
    }
    return value;
  },
  deny_module_list: function(value){
    if (think.isString(value)) {
      return [value];
    }
    if (!think.isArray(value)) {
      var msg = think.message('CONFIG_NOT_VALID', 'deny_module_list');
      throw new Error(msg);
    }
    return value;
  },
  error: {
    callback: function(value){
      return getFn(value, 'error.callback');
    }
  },
  output_content: function(value){
    return getFn(value, 'output_content');
  },
  create_server: function(value){
    return getFn(value, 'create_server');
  }
}