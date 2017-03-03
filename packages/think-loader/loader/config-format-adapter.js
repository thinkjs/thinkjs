const helper = require('think-helper');
const assert = require('assert');

/**
 * {
 *    db: {
 *        type: 'xxx',
 *        common: {
 *
 *        },
 *        xxx: {
 *
 *        }
 *    }
 * }
 * format adapter config, merge common field to item
 */
const formatAdapter = config => {
  for(let name in config){
    assert(config[name].type, `adapter config must have type field, name is ${name}`);
    if(config[name].common){
      let common = config[name].common;
      assert(helper.isObject(common), `adapter config's common field should be object type, name is ${name}`);
      delete config[name].common;
      for(let type in config[name]){
        if(type === 'type'){
          continue;
        }
        //merge common field to item
        config[name][type] = helper.extend({}, common, config[name][type]);
      }
    }
  }
  return config;
}

module.exports = formatAdapter;