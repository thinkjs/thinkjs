const ejs = require('ejs');
const helper = require('think-helper');
/**
 * ejs default render options
 * for more information on ejs options, refer to https://github.com/mde/ejs#options
 */
const defaultOptions = {
  cache: true
};
const fn = helper.promisify(ejs.renderFile);
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
    
    return fn(this.file, this.data, this.config);
  }
}

module.exports = Ejs;