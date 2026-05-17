/*
* @Author: lushijie
* @Date:   2017-04-07 09:14:25
* @Last Modified by:   lushijie
* @Last Modified time: 2017-04-07 18:32:37
*/

const svgCaptcha = require('svg-captcha');
const helper = require('think-helper');

const cacheFont = {};
const defaultOptions = {
  size: 4, // size of random string
  ignoreChars: '', // filter out some characters
  noise: 3, // number of noise lines
  color: false, // default grey, true if background option is set
  background: '#ffffff', // background color of the svg image
  width: 150, // width of captcha
  height: 50, // height of captcha
  fontPath: '',
  fontSize: 32, // captcha text size
  charPreset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' // random character preset
};

class ThinkSvgCaptcha {
  /**
   * [constructor description]
   * @param  {Object} options [description]
   * @return {Object}         [description]
   */
  constructor(options) {
    this.options = helper.extend({}, defaultOptions, options);
    this.options.charPreset && (svgCaptcha.options.charPreset = this.options.charPreset);

    if (this.options.fontPath) {
      const theCacheFont = cacheFont[this.options.fontPath];
      if (theCacheFont) {
        this.options.font = theCacheFont;
      } else {
        svgCaptcha.loadFont(this.options.fontPath);
        cacheFont[this.options.fontPath] = svgCaptcha.options.font;
      }
    }
  }

  /**
   * [create captcha]
   * @return {Object}  {data: 'svg path data', text: 'captcha text'}
   */
  create() {
    return svgCaptcha.create(this.options);
  }

  /**
   * [return a svg captcha based on text provided]
   * @param  {String} text [description]
   * @return {String}      [description]
   */
  svgCaptcha(text) {
    return svgCaptcha(text, this.options);
  }
}

module.exports = ThinkSvgCaptcha;
