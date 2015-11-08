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
  let msg = think.locale('CONFIG_NOT_FUNCTION', config);
  throw new Error(msg);
};
/**
 * config transform
 * @type {Object}
 */
export default {
  post: {
    /**
     * json content type list
     * @param  {Array} value []
     * @return {Array}       []
     */
    json_content_type: value => {
      if (think.isString(value)) {
        return [value];
      }
      if (!think.isArray(value)) {
        let msg = think.locale('CONFIG_NOT_VALID', 'post.json_content_type');
        throw new Error(msg);
      }
      return value;
    }
  },
  /**
   * sub doamin deploy
   * @param  {Object} value []
   * @return {Object}       []
   */
  subdomain: value => {
    if (think.isString(value)) {
      return {value};
    }
    if (think.isArray(value)) {
      let obj = {};
      value.forEach(item => {
        obj[item] = item;
      });
      return obj;
    }
    if (!think.isObject(value)) {
      let msg = think.locale('CONFIG_NOT_VALID', 'subdomain');
      throw new Error(msg);
    }
    return value;
  },
  /**
   * deby module list
   * @param  {Array} value []
   * @return {Array}       []
   */
  deny_module_list: value => {
    if (think.isString(value)) {
      return [value];
    }
    if (!think.isArray(value)) {
      let msg = think.locale('CONFIG_NOT_VALID', 'deny_module_list');
      throw new Error(msg);
    }
    return value;
  },
  /**
   * output content
   * @param  {String} value []
   * @return {Function}       []
   */
  output_content: value => getFn(value, 'output_content'),
  /**
   * create server
   * @param  {String} value []
   * @return {Function}       []
   */
  create_server: value => getFn(value, 'create_server'),
  /**
   * html cache config
   * @type {Object}
   */
  html_cache: {
    rules: rules => {
      let data = {};
      for(let key in rules){
        let value = rules[key];
        key = key.replace(/\:/g, '/');
        //to array
        if(!think.isArray(value)){
          value = [value];
        }
        if(think.isFunction(value[1])){
          value[2] = value[1];
          value[1] = 0;
        }
        data[key] = value;
      }
      return data;
    }
  },
  /**
   * cache config
   * @type {Object}
   */
  cache: {
    type: value => value.toLowerCase()
  },
  /**
   * session config
   * @type {Object}
   */
  session: {
    type: value => value.toLowerCase()
  }
};