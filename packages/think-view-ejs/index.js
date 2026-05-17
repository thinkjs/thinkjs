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
  constructor(viewFile, viewData, config) {
    this.viewFile = viewFile;
    this.viewData = viewData;
    this.config = config;
    this.handleOptions = helper.extend({
      filename: viewFile
    }, defaultOptions, config.options);
  }
  /**
   * render
   * @return {Promise}
   */
  render() {
    if (this.config.beforeRender) {
      this.config.beforeRender(ejs, this.handleOptions);
    }
    return renderFile(this.viewFile, this.viewData, this.handleOptions);
  }
}

module.exports = Ejs;
