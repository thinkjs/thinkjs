// Preserve eager Node initialization for the existing package entry.
require('./think');
module.exports = require('./application');
Object.defineProperty(module.exports, 'think', {
  value: global.think,
  enumerable: true
});
