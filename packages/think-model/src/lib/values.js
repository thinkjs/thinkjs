const helper = require('think-helper');

/**
 * get new values for rules
 * @param  {Object} rules []
 * @return {Object}       []
 */
function Values(rules) {
  const ret = {};
  const values = Values._getRuleValues(rules);
  for (const name in rules) {
    const itemValue = Values._getItemValue(rules[name], values, true);
    ret[name] = itemValue;
  }
  return ret;
}

/**
 * to boolean
 * @param  {Mixed} value []
 * @return {Boolean}       []
 */
Values._toBoolean = value => {
  return ['yes', 'on', '1', 'true', true].indexOf(value) > -1;
};

/**
 * get all rule values, for default function to get value
 * @param  {Object} rules []
 * @return {Object}       []
 */
Values._getRuleValues = rules => {
  const ret = {};
  for (const name in rules) {
    ret[name] = rules[name].value;
  }
  return ret;
};

/**
 * parse value
 * @param  {Mixed} value []
 * @param  {Object} item  []
 * @return {Mixed}       []
 */
Values._parseValue = (value, item) => {
  if (item.int || item.type === 'int') {
    return parseInt(value);
  } else if (item.float || item.type === 'float') {
    return parseFloat(value);
  } else if (item.boolean || item.type === 'boolean') {
    return Values._toBoolean(value);
  }
  return value;
};

/**
 * get item value
 * @param  {Object} item   []
 * @param  {Object} values []
 * @return {Mixed}        []
 */
Values._getItemValue = (item, values, parse) => {
  // get item value
  // avoid default is undefined, but check type is string
  let itemValue = item.value;
  // trim value
  if (item.trim && itemValue && itemValue.trim) {
    itemValue = itemValue.trim();
  }
  const _default = item.default;
  if (!itemValue && !helper.isTrueEmpty(_default)) {
    itemValue = item.default;
  }
  if (helper.isFunction(itemValue)) {
    itemValue = itemValue.call(values);
  }

  // make data to array when type is array
  if (item.value && item.array && !helper.isArray(item.value)) {
    if (helper.isString(itemValue)) {
      try {
        itemValue = JSON.parse(itemValue);
      } catch (e) {
        itemValue = itemValue.split(/\s*,\s*/);
      }
    } else {
      itemValue = [itemValue];
    }
  // make data to object when type is object
  } else if (item.value && item.object && helper.isString(itemValue)) {
    try {
      itemValue = JSON.parse(itemValue);
    } catch (e) {}
  } else if (item.boolean) {
    itemValue = Values._toBoolean(itemValue);
  }

  // parse value
  if (parse) {
    if (item.array) {
      itemValue = itemValue.map(it => Values._parseValue(it, item));
    } else {
      itemValue = Values._parseValue(itemValue, item);
    }
  }

  return itemValue;
};

module.exports = Values;
