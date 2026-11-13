exports.parse = (value) => {
  const result = Object.create(null);
  for (const [key, item] of new URLSearchParams(value)) {
    if (Object.hasOwn(result, key)) {
      result[key] = [].concat(result[key], item);
    } else {
      result[key] = item;
    }
  }
  return result;
};
