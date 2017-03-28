const ejs = require('ejs');
const helper = require('think-helper');
const renderFile = helper.promisify(ejs.renderFile, ejs);
/**
 * ejs default render options
 * for more information on ejs options, refer to https://github.com/mde/ejs#options
 */
const defaultOptions = {
  cache: true
};

class Ejs {
  /**
   * @param {String} file: filename(absolute path)of template
   * @param {Object} data
   * @param {Object} config
   */
  constructor(file, data, config) {
    this.file = file;
    this.data = data;
    this.config = helper.extend({
      filename: file
    }, defaultOptions, config);
  }
  /**
   * render
   * @return {Promise} 
   */
  render() {
    const config = this.config;
    if(config.beforeRender) {
      config.beforeRender(ejs, config);
    }
    return renderFile(this.file, this.data, config);
  }
}

module.exports = Ejs;
