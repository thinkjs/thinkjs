const os = require('os');
const path = require('path');

const templateCacheDirectory = path.join(os.homedir(), '.think-templates')

module.exports = {
  templateCacheDirectory
};
