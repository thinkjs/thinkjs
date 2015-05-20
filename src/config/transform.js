'use strict';

/**
 * get function
 * @param  {mixed} value  []
 * @param  {String} config []
 * @return {}        []
 */
let getFn = (value, config) => {
  if (!value || think.isFunction(value)) {
    return value;
  }
  value = global[value];
  if (think.isFunction(value)) {
    return value;
  }
  let msg = think.message('CONFIG_NOT_FUNCTION', config);
  throw new Error(msg);
}
/**
 * config transform
 * @type {Object}
 */
module.exports = {
  post: {
    json_content_type: value => {
      if (think.isString(value)) {
        return [value];
      }
      if (!think.isArray(value)) {
        let msg = think.message('CONFIG_NOT_VALID', 'post.json_content_type');
        throw new Error(msg);
      }
      return value;
    }
  },
  subdomain: value => {
    if (think.isString(value)) {
      return think.getObject(value, value);
    }
    if (think.isArray(value)) {
      let obj = {};
      value.forEach(item => {
        obj[item] = item;
      })
      return obj;
    }
    if (!think.isObject(value)) {
      let msg = think.message('CONFIG_NOT_VALID', 'subdomain');
      throw new Error(msg);
    }
    return value;
  },
  deny_module_list: value => {
    if (think.isString(value)) {
      return [value];
    }
    if (!think.isArray(value)) {
      let msg = think.message('CONFIG_NOT_VALID', 'deny_module_list');
      throw new Error(msg);
    }
    return value;
  },
  error: {
    callback: value => getFn(value, 'error.callback')
  },
  output_content: value => getFn(value, 'output_content'),
  create_server: value => getFn(value, 'create_server'),
  html_cache: {
    rules: rules => {
      let data = {};
      for(let key in rules){
        key = key.replace(/\:/g, '/');
        data[key] = rules[key];
      }
      return data;
    }
  },
  auto_reload_except: value => {
    return value.map(item => {
      if(think.isString(item) && process.platform === 'win32'){
        item = item.replace(/\//g, '\\');
      }
      return item;
    })
  }
}