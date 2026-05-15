const stringHash = require('string-hash');

exports.getWorkerByHash = (value, workers) => {
  const index = stringHash(value) % workers.length;
  return workers[index];
};
