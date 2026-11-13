exports.parse = (value) => {
  const result = Object.create(null);
  let count = 0;
  for (const [key, item] of new URLSearchParams(value)) {
    if (++count > 1000) break;
    if (Object.hasOwn(result, key)) {
      result[key] = [].concat(result[key], item);
    } else {
      result[key] = item;
    }
  }
  return result;
};
